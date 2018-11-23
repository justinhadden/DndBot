var Discord = require("discord.io");
var logger = require("winston");
var auth = require('./auth.json');
var axios = require('axios');

logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console,{
    colorize:true
});
logger.level = 'debug';

var bot = new Discord.Client({
    token: auth.token,
    autorun:true
});

bot.on('ready',function(evt){
    logger.info('Connected');
    logger.info('Logged in as:');
    logger.info(bot.username + ' -(' + bot.id + ')');
});
try{
    bot.on('message',function(user,userID,channelID,message,evt){
        // For spell queries
        if(message.substring(0,2) == '/s'){
            var args = message.substring(3);

            if(args[1]==undefined){
                bot.sendMessage({
                    to:channelID,
                    message:'You fucked up the syntax!'
                });
                return 0;
            }
            axios.get('http://www.dnd5eapi.co/api/spells/',{
                    params:{
                        name:args
                    }
                })
                .then(function(response){
                    console.log(response);
                    var url = response.data.results[0].url;
                    axios.get(url)
                        .then(function (response){
                            var def = "```"+response.data.name+"\n"+
                                "School of Magic: "+response.data.school.name+"\n"+
                                "Range: "+response.data.range+"\n"+
                                "Components: "+response.data.components+"\n"+
                                "Materials: "+response.data.material+"\n"+
                                "Ritual: "+response.data.ritual+"\n"+
                                "Spell Level: "+response.data.level+"\n"+
                                "Casting Time: "+response.data.casting_time+"\n"+
                                "Concentration: "+response.data.concentration+"\n"+
                                "Duration: "+response.data.duration+"\n"+
                                "Description: "+response.data.desc+"\n"+
                                "Higher Casting: "+response.data.higher_level+"\n```";
                            def.replace("â€™","'");
                            if(def.length>2000){
                                var middle = Math.floor(def.length / 2);
                                var before = def.lastIndexOf(' ',middle);
                                var after = def.indexOf(' ', middle + 1);

                                if (before == -1 || (after != -1 && middle - before >= after - middle)) {
                                    middle = after;
                                } else {
                                    middle = before;
                                }

                                var def1 = def.substr(0,middle)+"```";
                                var def2 = "```"+def.substr(middle+1);

                                bot.sendMessage({
                                    to:channelID,
                                    message:def1
                                });
                                bot.sendMessage({
                                    to:channelID,
                                    message:def2
                                });
                            }else{
                                bot.sendMessage({
                                    to:channelID,
                                    message:def
                                });
                            }
                        })
                        .catch(function(error){
                            console.log(error);
                        });
                    console.log(response.data);
                })
                .catch(function (error){
                    console.log(error);
                });
        }
        // For Conditions
        if(message.substring(0,2) == '/c'){
            var args = message.substring(3);

            if(args[1]==undefined){
                bot.sendMessage({
                    to:channelID,
                    message:'You fucked up the syntax!'
                });
                return 0;
            }
            axios.get('http://www.dnd5eapi.co/api/conditions/',{
                    params:{
                        name:args
                    }
                })
                .then(function(response){
                    var url = response.data.results[0].url;
                    axios.get(url)
                        .then(function (response){
                            var def = '```'+response.data.name+"\n"+
                                "Description: "+response.data.desc+"```";
                            bot.sendMessage({
                                to:channelID,
                                message:def
                            });
                        })
                        .catch(function(error){
                            console.log(error);
                        });
                })
                .catch(function (error){
                    console.log(error);
                });
        }
        // For Everything
        if (message.substring(0,4)=='/dnd'){
            var args = message.substring(1).split(' ');
            var search = '';
            for(var i = 0;i<args.length;++i){
                if(i>1){
                    search += args[i]+' ';
                }
            }
            search = search.replace(/\s+$/,'');
            axios.get('http://www.dnd5eapi.co/api/'+args[1]+'/',{
                params:{
                    name:search
                }
            })
            .then(function(response){
                var url = response.data.results[0].url;
                axios.get(url)
                .then(function(response){
                    var def = "```"+getDescriptionString(response.data,def);
                    def += '```';
                    console.log(def);
                    if(def.length>2000){
                        var middle = Math.floor(def.length / 2);
                        var before = def.lastIndexOf(' ',middle);
                        var after = def.indexOf(' ', middle + 1);
                        
                        if (before == -1 || (after != -1 && middle - before >= after - middle)) {
                            middle = after;
                        } else {
                            middle = before;
                        }
                        
                        var def1 = def.substr(0,middle)+"```";
                        var def2 = "```"+def.substr(middle+1);
                        
                        bot.sendMessage({
                            to:channelID,
                            message:def1
                        });
                        bot.sendMessage({
                            to:channelID,
                            message:def2
                        });
                    }else{
                        bot.sendMessage({
                            to:channelID,
                            message:def
                        });
                    }
                    
                })
                .catch(function(error){
                    console.log(error);
                });
            })
            .catch(function(error){
                console.log(error);
            });
        }
        // For Rolls
        if(message.substring(0,2) == '/r'){
            var args = message.substring(1).split(' ');
    
            if(args[1]==undefined){
                bot.sendMessage({
                    to:channelID,
                    message:'You fucked up the syntax!'
                });
                return 0;
            }
            var repeat = 1;
            if(args[4]!=undefined){
                repeat = parseInt(args[4]);
            }
            for(var i = 0;i<repeat;++i){
                var subArgs = args[1].split('d');
        
                var mod = 0
                if(args[2]!=undefined){
                    if(args[3]==undefined){
                        mod = parseInt(args[2]);
                    }else{
                        mod = parseInt(args[3]);
                    }
                }
        
                var diceNum = subArgs[0];
        
                var dice = subArgs[1];
        
                var result = 0;
                var resultString = '(';
                for(var j = 0;j<diceNum;++j){
                    roll = Math.floor(Math.random()*Math.ceil(dice)) + 1;
                    result += roll;
                    resultString += j==0 ? roll : '+'+roll;
                }
        
                if(mod!=0){
                    result += parseInt(mod);
                    resultString += ') + ' + mod + ' = '+result;
                }else{
                    resultString += ') = ' + result;
                }
        
                bot.sendMessage({
                    to:channelID,
                    message:"```"+user+' rolled '+args[1]+': '+resultString+"```"
                });
            }
        }
    });
}catch(error){
    console.log(error);
}

function getDescriptionString(obj,string = ''){
    for(prop in obj){
        if(prop == 'url')
            continue;
        if(typeof obj[prop] === 'object'){
            string += prop+":\n";
            string += getDescriptionString(obj[prop]);
        }else{

            string += prop+": "+obj[prop]+"\n";
        }
    }
    return string;
}
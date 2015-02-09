// ==UserScript==
// @name        pixivblocker
// @namespace   commies.pixivblocker
// @description nuke shit
// @include     /.*\/\/.*pixiv\.net/.*/
// @require     http://code.jquery.com/jquery-1.11.2.min.js
// @version     2.0.1
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_listValues
// ==/UserScript==

// the @grant is a workaround for jquery sandboxing or whatever

//utility functions
function arrayContains(needle, arrhaystack) {
    return (arrhaystack.indexOf(needle) > - 1);
}
function nukeThumbs(username) {
   $("li.image-item").each(function(v){
       var usern = $(this).find($(".ui-profile-popup"));
        if (usern.data("user_name") === username)
        {
            // Element exists with attribute. remove
            $(this).remove();
        }
   });
}
function findAnimationURL(){
    return unsafeWindow.pixiv.context.ugokuIllustFullscreenData.src || false;
}
function sescape(v){
    return v.replace(/&/, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

function rewriteImageURL(myurl){
    if(typeof myurl != 'undefined'){
        var myext = ".png";
        if(myurl.indexOf("_m.png") !== -1 ){
            myext = ".png";
        } else if (myurl.indexOf("_m.jpg") !== -1 ) {
            myext = ".jpg";
        } else if (myurl.indexOf("_m.gif") !== -1 ) {
            myext = ".gif";
        } else if(myurl.indexOf("_master1200.jpg") !== -1){
            var srcarr = myurl.split(/(\/.*\.net\/)(?:.*)(\/img\/(?:\d*\/)*\d*_)(.*)(?:_)(?:.*)(\.\S*$)/g);
            return [srcarr[1] + "img-original" + srcarr[2] + srcarr[3] + srcarr[4], unsafeWindow.pixiv.context.illustId + "_" + srcarr[3] + srcarr[4]];
        } else {
            var srcarr = myurl.split(/(\/.*\.net\/.*)(?:_)(\S*)(\.\S*$)/g);
            console.log(srcarr);
            return [srcarr[1] + "_big_" + srcarr[2] + srcarr[3], unsafeWindow.pixiv.context.illustId + "_" + srcarr[2] + srcarr[3]];
        }

        return [myurl.substr(0, myurl.indexOf("_m"+myext)) + myext, "testtest"];
    }
    return myurl;
}


//oop config object i guess
var configObj = function (settings, prefix) {
    this.settings = settings;
    this.prefix = prefix;
};
configObj.prototype.set = function(name, value) {
    //just fucken stringify everything who cares!!!
    value = JSON.stringify(value);
    GM_setValue(this.prefix + name, value);
};
configObj.prototype.get = function(name) {
    var value = GM_getValue(this.prefix + name, this.settings[name]);
    var tempvalue;
    try{ tempvalue = JSON.parse(value); } catch (e) { }
    //if(name !== 'debug')
    return tempvalue || value;
};
configObj.prototype.reset = function(name) {
    GM_deleteValue(this.prefix + name);
    console.log("Reset the value of " + this.prefix + name);
};
configObj.prototype.resetAll = function(){
    //HACK: greasemonkey keeps having GM_ListValues() break and this is a bad workaround
    //https://github.com/greasemonkey/greasemonkey/issues/2033
    var keys = cloneInto(GM_listValues(), window);
    keys.map(function(key) {
        if(key.indexOf(this.prefix) !== -1){
            GM_deleteValue(key);
        }
    });

    console.log("Deleted the following keys: ", keys);
};
configObj.prototype.list = function(){
    //HACK: greasemonkey keeps having GM_ListValues() break and this is a bad workaround
    //https://github.com/greasemonkey/greasemonkey/issues/2033
    //weird map thing also... idk this is really kind of dumb
    var keys = cloneInto(GM_listValues(), window);
    var mythis = this; //HACK: inline functions use wrong this :^)

    return keys.map(function(key) {
        if(key.indexOf(mythis.prefix) !== -1){
            var t = {};
            t[key] = GM_getValue(key);
            return t;
        }
    });
};
configObj.prototype.exportSetting = function (settvar){
    alert("Copy the following:\r\n\r\n" + this.get(settvar));
};
configObj.prototype.importSetting = function (settvar){
    try {
        var wef = prompt("Paste your blocked users separated by comma:");
        if(wef){
            wef = wef.replace(/([^,]+)/g, "\"$&\"");
            wef = "[" + wef + "]"; 
            wef = JSON.parse(wef);
            config.set(settvar, wef);
        }
    } catch (e) {
        console.log('Error: ', e);
        alert("Error: ", e);
    }
};
configObj.prototype.listManage = function(thelist, theuser, noadd){
    var shitlist = this.get(thelist);

    if(typeof(noadd) === 'undefined') noadd = false;

    if(noadd === true){
        alert("You need to specify a user to unblock!");
    }else if (!theuser) {
        theuser = prompt("Enter Username Here", "Type here");
    }

    if(arrayContains(theuser, shitlist)){
        if(confirm('Are you sure you want to unblock this user?')){
            shitlist.splice(shitlist.indexOf(theuser), 1);
            this.set(thelist, shitlist );
        }
        return false;
    }

    //user wasn't in list and noadd is not defined AND false
    if (noadd === false && confirm('Add to Filterlist?')){
        shitlist[shitlist.length] = theuser;
        this.set(thelist, shitlist);
        return true;
    }
    return false;
};


//actually create our config objects with default parameters
var config = new configObj(
    {
        'shitusers': [],
    },
    "setting_"
);

function populateCSS(){
    var ourcss = "";

    ourcss += ".image-item { height:auto !important; }"; //fixes heights being cut off
    ourcss += ".popular-introduction { position:relative !important; top: 0px !important; left: 0px !important; }"; //fixes popular thing being in the way terribly
    ourcss += ".pixivblocker_minus { padding:0px 4px; background: #77FF88; color:#FFF; cursor:pointer;}";
    ourcss += ".pixivblocker_plus { padding:0px 4px; background: #FF7788; color:#FFF; cursor:pointer; margin-left:5px;}";
    ourcss += ".pixivblocker_shitdiv {width:95%; margin:auto; margin-bottom: 15px; border-bottom: 2px dashed rgba(0,0,0,.2);}";
    ourcss += ".pixivblocker_shitdiv ul {max-height: 0; transition: max-height 1s ease-out .4s; overflow: hidden; list-style: none; display:block;}";
    ourcss += ".pixivblocker_shitdiv:hover ul {max-height:9999px; transition: max-height 1s ease-in .4s;}";
    ourcss += ".pixivblocker_shitdiv h3 { font-weight: bolder; font-size: 110%; margin-bottom: 5px;}";
    ourcss += ".pixivblocker_shitdiv h3 small { font-size: 70%;}";
    ourcss += ".pixivblocker_shitdiv ul li { padding-left:3px; display:inline-block; background: rgba(0,0,0,.1); margin:5px;}";
    //ourcss += ".pixivblocker_shitusers li:after { content: ', '}";
    //ourcss += ".pixivblocker_shitusers li:last-child:after {content: ''; }";

    //now we actually add our CSS to the page
    if (document.getElementById("PB_CSS") !== null){
        document.getElementById("PB_CSS").innerHTML = ourcss;
    } else {
        var head = document.head;
        if (!head) { return; }
        var style = document.createElement('style');
        style.type = 'text/css';
        style.id = "PB_CSS";
        style.innerHTML = ourcss;
        head.appendChild(style);
    }
}


var addedshitusers = false;
function addShitUserList(){
    if(!addedshitusers){

        var shitusers = config.get('shitusers');
        var ourdiv = $('#pixivblocker_shitdiv');
        var datalist = $(document.createElement('datalist'));

        for(var v = 0; v < shitusers.length; v++){
            datalist.append($(document.createElement('option'))
                .attr("value", shitusers[v])
            );
        }

        datalist.attr("id", "shitusers").appendTo(ourdiv);
    }
    addedshitusers = true;
}

function detectPageStuff(){
    var animcontain = $("._ugoku-illust-player-container");
    var imgcontain = $(".works_display div img");
    var ismanga = $(".works_display a");
    var mangacontain = $("#main .manga .item-container img");

    if(animcontain.length > 0){
        var coolbutton = document.createElement('a');
        coolbutton.setAttribute("class", "_button");
        coolbutton.setAttribute("href", this.findAnimationURL());
        coolbutton.innerHTML += "Download Animation As .ZIP";
        $("._work-detail-unit .action").first().prepend(coolbutton);
    } else if(imgcontain.length && ismanga.length < 1 ){
        var myurl = imgcontain.attr('src');

        myurl = rewriteImageURL(myurl)[0];

        var coolbutton = document.createElement('a');
        coolbutton.setAttribute("class", "_button");
        coolbutton.setAttribute("href", myurl);
        coolbutton.innerHTML += "Download Full Size Image";
        $("._work-detail-unit .action").first().prepend(coolbutton);
    } else if(mangacontain.length > 0) {
        var mangadiv = document.createElement('div');
        mangadiv.id = "mangaimgdownload";
        mangadiv.style = "max-width: 250px; margin: 10px; position: fixed; overflow-y:auto; max-height: calc(100% - 20px);";
        mangadiv.innerHTML = "<strong>Download HI-RES Images</strong>";
        $("#main .manga").prepend(mangadiv);

        mangacontain.each(function(v){
            var src = $(this).data("src");
            var srcarr = PB_CFG.rewriteImageURL(src);
            src = srcarr[0];

            if(typeof src != 'undefined'){
                var currname = srcarr[1];
                var coolbutton = document.createElement('a');
                //coolbutton.setAttribute("class", "_button");
                coolbutton.setAttribute("href", src);
                coolbutton.target = '_blank';
                coolbutton.download = srcarr[1];
                coolbutton.style = "display: block;";
                coolbutton.innerHTML += "Download " + srcarr[1];
                $("#mangaimgdownload").append(coolbutton);
            }
        });
    }
}


function init() {
    var shitusers = config.get('shitusers');
    console.log("[PixivBlocker] Currently blocking " + shitusers.length + " shit users.");

    var testElements = $("li.image-item");

    //go through list of thumbnails and add stuff to them
    $("li.image-item").each(function(v){
         var username = $(this).find($(".ui-profile-popup"));
         if(username.data("user_name") !== 'undefined'){
            u = "" + username.data("user_name");
            u = sescape(u);

            //if shit user
            if (arrayContains(u, shitusers)) {
                $(this).remove();
            }
            else{
                username.parent().append($(document.createElement('span'))
                    .addClass("pixivblocker_plus")
                    .click(function(){
                        if(config.listManage('shitusers', u)){
                            nukeThumbs(u);
                        }
                     })
                     .text("🚫")
                     .attr("title", "Add user to pixivblocker")
                     .appendTo(username.parent())
                );
            }
       }
    });



    //add list of shitusers at bottom of page
    var targetcontainer = $(".contents-main .NewsTop");
    if(targetcontainer.length == 0){ targetcontainer = $(".layout-body ._unit").first(); }

    //we should have found somewhere to put it, but it's possible we haven't so
    if(targetcontainer.length !== 0){
        targetcontainer.append($(document.createElement('div'))
            .attr("id", "pixivblocker_shitdiv").addClass("pixivblocker_shitdiv")
            .append($(document.createElement('h3'))
                .html("Shit users you've blocked:")
            )
            .append($(document.createElement("input"))
                .attr("list", "shitusers")
                .attr("id", "shituserinput")
                .focus(function(){addShitUserList();})
            )
            .append($(document.createElement("button"))
                .text("Unblock User")
                .click(function(){
                    config.listManage("shitusers", $("#shituserinput").val(), true);
                })
            )
            .append($(document.createElement("br")))
            .append($(document.createElement('button'))
                .text("!! Unblock all users !!")
                .click(function(){ config.reset("shitusers"); })
            )
            .append($(document.createElement('button'))
                .text("EXPORT")
                .click(function(){ config.exportSetting("shitusers"); })
            )
            .append($(document.createElement('button'))
                .text("IMPORT")
                .click(function(){ config.importSetting("shitusers"); })
            )
        )
    }

    detectPageStuff();
}


populateCSS();
init();

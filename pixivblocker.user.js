// ==UserScript==
// @name        pixivblocker
// @namespace   commies.pixivblocker
// @description nuke shit
// @include     /.*\/\/.*pixiv\.net/.*/
// @require     http://code.jquery.com/jquery-1.11.2.min.js
// @version     2.0.10
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
function nukeThumbs(username, nuke) {    
   $("li.image-item").each(function(v){
       var usern = $(this).find($(".ui-profile-popup"));
        if (usern.data("user_name") === username)
        {
            // Element exists with attribute. remove

            if(nuke === true){
                $(this).remove();
            } else {
                hideThumbs($(this));
            }
        }
   });
}

function hideThumbs(node){
    var target = $("#blockedthumbs");
    
    if(target.length == 0){
        var target = $("#wrapper .layout-body");
        var temp = $(document.createElement("section"));
        temp.attr("id", "blockedthumbscontainer")
            .addClass("_unit")
            .click(function(){
                $("#blockedthumbs").removeClass("pixivblocker_hidden");
            })
            .append($(document.createElement("h2"))
                .text("Blocked Thumbnails")
                .addClass("column-title")
            )
            .append($(document.createElement("h3"))
                .text("Click to see the thumbnails!")
            )
            .append($(document.createElement("div"))
                .attr("id", "blockedthumbs")
                .addClass("pixivblocker_hidden")
            );
        target.append(temp);
    }
    
    node.appendTo($("#blockedthumbs"));
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
            return [srcarr[1] + "_big_" + srcarr[2] + srcarr[3], unsafeWindow.pixiv.context.illustId + "_" + srcarr[2] + srcarr[3]];
        }

        return [myurl.substr(0, myurl.indexOf("_m"+myext)) + myext, "testtest"];
    }
    return myurl;
}

function checkIfImageExists(myurl){
    
    var extsToCheck = [".jpg",".png"];
    
    for(var i=0, found=false; i<extsToCheck.length || found; i++){
        var newurl = myurl.replace(/\.[^/.]+$/, "") + extsToCheck[i];

        var img = document.createElement('img');
        img.src = newurl;
        img.style = "visibility:hidden;"
        document.body.appendChild(img);
        
        if( img.height != 0 ){ //exists
             document.body.removeChild(img);
            return newurl;
        }
        document.body.removeChild(img);
    }
    return false;
}

//OOP config object
var configObj = function (prefix, settings, descriptions) {
    this.settings = settings;
    this.descriptions = descriptions;
    this.prefix = prefix;
    this.allowDelete = true;
    this.allowEdit = true;

    this.set = function(name, value) {
        //just fucken stringify everything who cares!!!
        value = JSON.stringify(value);
        //console.log("Set the value of " + this.prefix + name + " to: " + value);
        GM_setValue(this.prefix + name, value);
    };
    this.update = function(name, value){
        //super hacky
        this.set(name.substr(this.prefix.length), value);
    };
    this.get = function(name, def) {
        if(arrayContains(this.prefix, name)){
            name = name.substr(this.prefix.length);
        }
        
        var value = GM_getValue(this.prefix + name);

        // nothing is set yet, so make sure to set our default for easy configuration
        if(typeof value === 'undefined' || value == null) {
            value = def || this.settings[name];
            if(typeof(value) !== 'undefined') this.set(name, value);
            return value;
        }

        //parse non-strings into an actual usable object
        var tempvalue;
        try{
            var tempvalue = JSON.parse(value);
        } catch (e){}
        //if(name !== 'debug')
        return tempvalue || value;
    };
    this.reset = function(name) {
        if(confirm('Are you sure you want to RESET THIS SETTING???')){
            var mypref = this.prefix + name;
            GM_deleteValue(mypref);
            console.log("Reset the value of " + mypref);
        }
    };
    this.resetAll = function(){
        //HACK: greasemonkey keeps having GM_ListValues() break and this is a bad workaround
        //https://github.com/greasemonkey/greasemonkey/issues/2033
        var keys = cloneInto(GM_listValues(), window);
        var mythis = this; //hack
        keys.map(function(key) {
            if(key.indexOf(mythis.prefix) !== -1){
                //console.log("Deleted key: ", key);
                GM_deleteValue(key);
            }
        });
    };
    this.resetAllContains = function(search){
        //HACK: greasemonkey keeps having GM_ListValues() break and this is a bad workaround
        //https://github.com/greasemonkey/greasemonkey/issues/2033
        var keys = cloneInto(GM_listValues(), window);
        var mythis = this; //hack
        
        //use a substr to check if that last section of it is identical or not
        keys.map(function(key) {
            if(key.indexOf(mythis.prefix) !== -1 && key.substr(key.length - search.length) === search){
                console.log("Deleted key: ", key);
                GM_deleteValue(key);
            }
        });
    };
    this.list = function(){
        //HACK: greasemonkey keeps having GM_ListValues() break and this is a bad workaround
        //https://github.com/greasemonkey/greasemonkey/issues/2033
        //weird map thing also... idk this is really kind of dumb
        var keys = cloneInto(GM_listValues(), window);
        var mythis = this; //HACK: inline functions use wrong this :^)
        
        for(var s in this.settings){
            if(!arrayContains(this.prefix + s, keys)){
                keys[keys.length] = this.prefix + s;
            }
        }
        
        keys = keys.filter(function(key) {
            if(key.indexOf(mythis.prefix) !== -1){
                return true;
            }
        });

        keys = keys.map(function(key) {
            var t = {};
            t[key] = mythis.get(key);
            t[key] = JSON.parse(GM_getValue(key));
            return t;
        });
        
        return keys;
    };
    this.prettyPrint = function(node, key, value){
        //used in clicks
        var mythis = this;
        // because we automatically prefix keys
        var prefixless = key.substr(this.prefix.length);

        var myrow = $(document.createElement("tr"));
        node.append(myrow);

        myrow.append($(document.createElement("td"))
            .text(this.descriptions[prefixless] || key)
            .addClass("pixivblocker_config key")
        );

        if(this.allowEdit === true){
            var mycell = $(document.createElement("td"))
                .addClass("pixivblocker_config value " + typeof(value));

            var myinput = $(document.createElement("input")).attr("value", value);
            console.log(node, key, value);

            switch(typeof value){
                case "number":
                    myinput.attr("type", "number");
                case "string":
                default:
                    if(value.toString() === 'false' || value.toString() === 'true'){
                         myinput.attr("type", "checkbox").attr("checked", value.toString() === 'true')
                        .click(function(){ console.log(key, this.checked); mythis.update(key, this.checked); });
                    } else {
                        myinput.change(function(){
                            var myval = this.value;
                            try{ myval = JSON.parse(this.value); } catch(e) { /* this is mostly just for numbers anyways */ }
                            mythis.update(key, myval);
                        });
                    }
                    break;
            }

            myrow.append(mycell.append(myinput));
        } else {
            myrow.append($(document.createElement("td"))
                .text(value)
                .addClass("pixivblocker_config value " + typeof(value))
            );
        }

        if(this.allowDelete === true){
            myrow.prepend($(document.createElement("td"))
                .text("X")
                .click(function(){ mythis.reset(prefixless); $(this).parent().remove(); })
                .css("cursor", "pointer")
                .addClass("pixivblocker_config delete")
            )
        }
    };
    this.prettyPrintList = function(target){
        var mytable = $(document.createElement("table"));
        mytable.addClass("pixivblocker_config");
    
        target.append($(document.createElement("h3"))
            .addClass("blocksubhead")
            .text(this.displayName || "Header")
        ).append($(document.createElement("div"))
            .addClass("section")
            .append(mytable)
        );

        var myrow = $(document.createElement("tr"));
        mytable.append($(document.createElement("thead")).append(myrow));

        myrow.append($(document.createElement("th"))
                .text("Key")
                .addClass("pixivblocker_config key")
            )
            .append($(document.createElement("th"))
                .text("Value")
                .addClass("pixivblocker_config value")
            );
            
        if(this.allowDelete === true){
            myrow.prepend($(document.createElement("th"))
                .text("Reset")
                .addClass("pixivblocker_config delete")
            );
        }

        var mylist = this.list();
        for(var i = 0; i < mylist.length; i++){
            var mykey = Object.keys(mylist[i])[0];
            //console.log(i, mykey, mylist[i], mylist[i][mykey]);
            this.prettyPrint(mytable, mykey, mylist[i][mykey]);
        }
    };

    this.exportSetting = function (settvar){
        return this.get(settvar);
    };
    this.importSetting = function (settvar, values){
        var mythis = this;
        try {
            var wef = values;
            if(wef){
                wef = wef.replace(/([^,]+)/g, "\"$&\"");
                wef = "[" + wef + "]"; 
                wef = JSON.parse(wef);
                mythis.set(settvar, wef);
            }
        } catch (e) {
            console.log('Error: ', e);
            alert("Error: ", e);
        }
    };

    this.listManage = function(thelist, theuser, noadd){
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
};

//actually create our config objects with default parameters
var data = new configObj( "setting_",
    {
        'shitusers': [],
    }
);
data.allowEdit = false;
data.allowDelete = false;
data.displayName = "Shit Users";

var config = new configObj( "config_",
    {
        'showlargeimages': true,
        'showlargeimagesall': false,
        'hideshitusers': true,
        'nukeshitusers': true,
        'blockads': false,
    },
    {
        'showlargeimages': "Large Image Download (View Image Page)",
        'showlargeimagesall': "Large Image Download (Everywhere else)",
        'hideshitusers': "Allows you to hide shit users",
        'nukeshitusers': "If hiding shit users, completely nukes the images",
        'blockads': "Block the text ads aren't blocked by adblock like a douche :)",
    }
);
config.displayName = "Configuration";

function populateCSS(){
    var ourcss = "";

    ourcss += "*::selection { background: #258FB8; color:#fff; }"; //pixiv has a really light selection color by default which is dumb
    ourcss += "*::-moz-selection { background: #258FB8; color:#fff; }"; //pixiv has a really light selection color by default which is dumb
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
    ourcss += ".pixivblocker_footer h2 { font-size: 130%; font-weight: bold;}";
    ourcss += ".pixivblocker_footer .container { padding: 10px; }";
    ourcss += ".pixivblocker_hidden {display:none;}";
    
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

        var shitusers = data.get('shitusers');
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

function removeads(){
    //generic
    $(".ad, .ads_anchor, .multi-ads-area, .pay-button, .showcase-reminder, .require-premium").remove();
    
    //homepage
    $("aside.comic-container a.hover-item, aside.comic-container div.area_inside, .ui-layout-west .area_new:nth-last-child(2), .ui-layout-west .area_new:nth-last-child(1)").remove();
    
    //prem offer below username
    $("a[href=\"/premium.php?ref=premium_campaign\"]").remove();
    
    //prem offer below section thumbnails
    $("a[href=\"/premium.php?ref=popular_d_body\"]").remove();
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
        myurl = checkIfImageExists(myurl);

        var coolbutton = document.createElement('a');
        coolbutton.setAttribute("class", "_button");
        
        if(myurl) {
            coolbutton.setAttribute("href", myurl);
            coolbutton.innerHTML += "Download Full Size Image";
            
        } else {
            coolbutton.innerHTML += "Something went wrong!";
        }
        
        $("._work-detail-unit .action").first().prepend(coolbutton);
        
    } else if(mangacontain.length > 0) {
        var mangadiv = document.createElement('div');
        mangadiv.id = "mangaimgdownload";
        mangadiv.style = "max-width: 250px; margin: 10px; position: fixed; overflow-y:auto; max-height: calc(100% - 20px);";
        mangadiv.innerHTML = "<strong>Download HI-RES Images</strong><p><small>DownThemAll regex: </small><input type=\"text/css\" value=\"/.*_p\\d*\\.jpg/\"></input></p>";
        $("#main .manga").prepend(mangadiv);

        mangacontain.each(function(v){
            var src = $(this).data("src");
            var srcarr = rewriteImageURL(src);
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

function doPageSpecific(t, v, loc){
    if(config.get("showlargeimagesall") === true){
        switch(loc){
            case "member_illust.php":
                var myurl = t.find("img").attr('src');

                myurl = rewriteImageURL(myurl)[0];
                myurl = checkIfImageExists(myurl);
                
                t.append($(document.createElement('a'))
                    .addClass("_button pixivblocker_viewlarge")
                    .attr("href", myurl)
                    .text("view large")
                    .attr("title", "Download Large")
                );
                break;
            default:
                console.log("Basic page!");
        }
    }
}

function determinePage(){
    var loc = window.location.pathname.substr(1); //get our page/queries, and remove leading slash

    var te = loc.indexOf("/"); //still have slash?
    if(te !== -1){
        loc = loc.substr(0,te+1); //trim everything after slash
    } else {
        te = loc.indexOf(".php");
        if (te !== -1) {
            loc = loc.substr(0,te+4); //trim everything after ".php"
        }
    }
    
    return loc;
}


function addConfigPanelThing(){
    var mydiv = $(document.createElement('div')).addClass("container");
    
    $("#wrapper").append(
        $(document.createElement('div'))
        .addClass("footer pixivblocker_footer")
        .append(mydiv)
    );
    
    mydiv.append($(document.createElement('h2'))
        .text("Pixiv Blocker Settings")
    );
    
    var configbody = $(document.createElement('div'));
    mydiv.append(configbody);
    
    config.prettyPrintList(configbody);
}

function init() {
    var shitusers = data.get('shitusers');
    if(shitusers && typeof shitusers !== "undefined" && shitusers !== "null") {
        console.log("[PixivBlocker] Currently blocking " + shitusers.length + " shit users.");
    }
    
    var testElements = $("li.image-item");
    
    var pageUrl = determinePage();
    
    if(config.get("blockads") === true){
        removeads();
    }

    //go through list of thumbnails and add stuff to them
    $("li.image-item").each(function(v){
         var t = $(this);
        
         doPageSpecific(t, v, pageUrl);
        
         if(config.get("hideshitusers") === true){
             var username = t.find($(".ui-profile-popup"));
             
             if(username.data("user_name") !== 'undefined'){
                var u = "" + username.data("user_name");
                u = sescape(u);

                //if shit user
                if (arrayContains(u, shitusers)) {
                    if(config.get("nukeshitusers") === true){
                        t.remove();
                    } else {
                        hideThumbs(t);
                    }
                }
                else{
                    username.parent().append($(document.createElement('span'))
                        .addClass("pixivblocker_plus")
                        .click(function(){
                            if(data.listManage('shitusers', u)){
                                nukeThumbs(u, config.get("nukeshitusers"));
                            }
                         })
                         .text("🚫")
                         .attr("title", "Add user to pixivblocker")
                         .appendTo(username.parent())
                    );
                }
           }
       }
    });
    
    addConfigPanelThing();


    if(config.get("hideshitusers") === true){

        //add list of shitusers at bottom of page
        var targetcontainer = $(".pixivblocker_footer");

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
                        data.listManage("shitusers", $("#shituserinput").val(), true);
                    })
                )
                .append($(document.createElement("hr")))
                .append($(document.createElement("br")))
                .append($(document.createElement('h3'))
                    .html("Shit user import/export:")
                )
                .append($(document.createElement("input"))
                    .attr("id", "shituserimportexport")
                )
                .append($(document.createElement("br")))
                .append($(document.createElement('button'))
                    .text("!! Unblock all users !!")
                    .click(function(){ data.reset("shitusers"); })
                )
                .append($(document.createElement('button'))
                    .text("EXPORT")
                    .click(function(){ 
                        $("#shituserimportexport").val(data.exportSetting("shitusers")); 
                    })
                )
                .append($(document.createElement('button'))
                    .text("IMPORT")
                    .click(function(){ 
                        data.importSetting("shitusers", $("#shituserimportexport").val()); 
                    })
                )
            )
        }
    }
        
    detectPageStuff();
}


populateCSS();
init();

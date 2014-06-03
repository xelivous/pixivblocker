// ==UserScript==
// @name        pixivblocker
// @namespace   commies.pixivblocker
// @description nuke shit
// @include     /http://.*pixiv\.net/.*/
// @include     /https?://.*pixiv\.net/.*/
// @version     1.1.2
// @grant       none
// ==/UserScript==
function PB_CFG_CREATE() {
    return {
        'settings' : {
            'shitusers': []
        },
        getArray: function (myvar)
        {
            if ((localStorage.getItem(myvar) === null) || (localStorage.getItem(myvar) === ''))
            {
                console.log(myvar);
                return this.settings[myvar];
            } 
            else
            {
                return localStorage.getItem(myvar).split(',');
            }
        },
        setArray: function (usersetting, settingvar)
        {
            try {
                return localStorage.setItem(usersetting, settingvar.toString());
            } catch (e) {
                console.log('Error: ' + e);
            }
        },
        nukeSetting: function(settvar){
            try {
                if(confirm('Really unblock all users??')){
                    localStorage.removeItem(settvar);
                }
            } catch (e) {
                console.log('Error: ' + e);
            }
        },
        exportSetting: function (settvar){
            alert("Copy the following:\r\n\r\n" + localStorage.getItem(settvar));  
        },
        importSetting: function (settvar){
            try {
                var wef = prompt("Paste your blocked users separated by comma:");
                if(wef){
                   localStorage.setItem(settvar, wef);
                }
            } catch (e) {
                console.log('Error: ' + e);
            }
        },
        arrayContains: function (needle, arrhaystack)
        {
            return (arrhaystack.indexOf(needle) > - 1);
        },
        listManage: function(thelist, theuser){
            var realshitlist = this.getArray(thelist);
            if (!theuser) {
                theuser = prompt("Enter Username Here", "Type here");
            }
            var willyou = false;
            
            //check if user is already in the list
            for (var x=0; x<realshitlist.length; x++) {
                var thisblistitem = realshitlist[x];
                if ( theuser === thisblistitem ) {
                    willyou = confirm('Are you sure you want to unblock this user?');
                    if (willyou){
                        realshitlist.splice(x,1);
                        this.setArray(thelist, realshitlist );
                    }
                    return false;
                }
            }
            
            //user wasn't in list
            willyou = confirm('Add to Filterlist?');
            if (willyou){
                realshitlist[realshitlist.length] = theuser;
                this.setArray(thelist, realshitlist );
                
                return true;
            }
            return false;
        },
        nukeThumbs: function(username){
            var allElements = document.getElementsByClassName('image-item');
            for (var i = 0, n = allElements.length; i < n; i++)
            {
                if (this.sescape(allElements[i].childNodes[1].attributes['data-user_name'].value) === username)
                {
                    // Element exists with attribute. Add to array.
                    allElements[i].parentNode.removeChild(allElements[i]);
                }
            }
        },
        sescape: function(v){
            return v.replace(/&/, "&amp;").replace(/'/g, "&#39;").replace(/"/g, "&quot;");
        },
        init: function ()
        {
            var shitusers = PB_CFG.getArray('shitusers');
            var testElements = document.getElementsByClassName('image-item');
            var testDivs = Array.prototype.filter.call(testElements, function (testElement) {
                return testElement.nodeName === 'LI';
            });
            var coolspan;
            //go through list of thumbnails and add stuff to them
            for (var v = 0, u = null; v < testElements.length; v++, u = null) {
                u = testElements.item(v).childNodes[1].attributes['data-user_name'].value
                u = this.sescape(u);
                
                //add +/- next to names
                coolspan = document.createElement('span');
                
                //if shit users
                if (PB_CFG.arrayContains(u, shitusers)) {
                    testElements.item(v).parentNode.removeChild(testElements.item(v));
                    v--;
                    //testElements.item(v).childNodes[0].innerHTML = 'This user is shit<br>';
                    
                    /*coolspan.className = "pixivblocker_minus";
                    coolspan.setAttribute("onclick", "PB_CFG.listManage('shitusers','"+u+"');");
                    coolspan.innerHTML = "❤";
                    coolspan.title = "Remove from pixivblocker";*/
                }
                else{
                    coolspan.className = "pixivblocker_plus";
                    coolspan.setAttribute("onclick", "if(PB_CFG.listManage('shitusers','"+u+"')) PB_CFG.nukeThumbs('"+u+"');");
                    coolspan.innerHTML = "🚫";
                    coolspan.title = "Add user to pixivblocker";
                    testElements.item(v).insertBefore(coolspan, testElements.item(v).childNodes[1].nextSibling);
                }
            }
            
            //add list of shitusers at bottom of page
            var cooldiv = document.createElement('div');
            cooldiv.className = "pixivblocker_shitdiv";
            cooldiv.innerHTML = "<h3>Shit users you've blocked: <small>(hover me)</small></h3>\r\n";
            
            var coolbutton = document.createElement('button');
            coolbutton.type = "button";
            coolbutton.innerHTML += "!! Unblock all users !!";
            coolbutton.setAttribute("onclick", "PB_CFG.nukeSetting('shitusers');");
            cooldiv.innerHTML += coolbutton.outerHTML;
            
            coolbutton = document.createElement('button');
            coolbutton.type = "button";
            coolbutton.innerHTML += "EXPORT";
            coolbutton.setAttribute("onclick", "PB_CFG.exportSetting('shitusers');");
            cooldiv.innerHTML += coolbutton.outerHTML;
            
            coolbutton = document.createElement('button');
            coolbutton.type = "button";
            coolbutton.innerHTML += "IMPORT";
            coolbutton.setAttribute("onclick", "PB_CFG.importSetting('shitusers');");
            cooldiv.innerHTML += coolbutton.outerHTML;
            
            var coollist = document.createElement('ul');
            coollist.className = "pixivblocker_shitusers";
            for(var v = 0; v < shitusers.length; v++){
                var coolitem = document.createElement('li');
                
                coolspan = document.createElement('span');
                
                coolspan.className = "pixivblocker_minus";
                coolspan.setAttribute("onclick", "PB_CFG.listManage('shitusers','"+shitusers[v]+"');");
                coolspan.innerHTML = "❤";
                coolspan.title = "Remove from pixivblocker";
                
                coolitem.innerHTML = shitusers[v] + " " + coolspan.outerHTML;
                
                coollist.innerHTML = coolitem.outerHTML + "\r\n" + coollist.innerHTML;
            }
            cooldiv.innerHTML += coollist.outerHTML;
            
            var targetcontainer = testElements.item(0).parentNode.parentNode;
            targetcontainer.insertBefore(cooldiv, targetcontainer.nextSibling);
        }
    };
}

function populateCSS(){
    var ourcss = "";

    ourcss += ".image-item { height:auto !important; }";
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
        var head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        var style = document.createElement('style');
        style.type = 'text/css';
        style.id = "PB_CSS";
        style.innerHTML = ourcss;
        head.appendChild(style);
    }
}

function addJS (str){
    var head = document.getElementsByTagName('head')[0];
    if (!head) { return; }
    var style = document.createElement('script');
    style.innerHTML = str;
    head.appendChild(style);
}

var cooljs = ''+
PB_CFG_CREATE.toString()+
'var PB_CFG = new PB_CFG_CREATE();'+
'PB_CFG.init();';

    addJS(cooljs);
    populateCSS();

// ==UserScript==
// @name        pixivblocker
// @namespace   commies.pixivblocker
// @description nuke shit
// @include     /http://.*pixiv\.net/.*/
// @include     /https?://.*pixiv\.net/.*/
// @version     1.0.2
// @grant       none
// ==/UserScript==
function PB_CFG_CREATE() {
    return {
        'settings' : {
            'shitusers': [
                'KALECHIP',
                'plorb',
                'Streled01',
                'Xen',
                'RYU',
                'ome',
                'keiko66613',
                'Planeptune',
                'サイバネティック蟹',
                'Hardpoint',
                'jantosze',
                'superseo34',
                'Bristles',
                '星野',
                'みおん_orz',
                'maxsmeagol',
                'soja23',
                'axel',
                'Canastus',
                '泥　どねる',
                'zzz',
                'Cote',
                'ユウキ',
                'ケモノ武士',
                'ざｔ',
                '雲呑汁',
                'TSB',
                'くしな　くぅえる(空・L)',
                'TDn\'A',
                'hoshime',
                'Nurinaki',
                'クマジ',
                '兵器送貨員‧真改',
                'sparky_the_chu',
                'Sexylark',
                'ss2',
                'neurodyne',
                'アマシュン',
                'Konata5',
                'Kyoma[充電中]',
                'karintou18',
                '元気',
                'ガルバニー電流',
                '緋乃ひの',
                'おくに（一志）',
                'るーあ',
                'chkeal',
                'Southern_Cross',
                '黒点魚',
                'ナオキ（渋麻呂）',
                '焼き蛇',
                'mrjeckil',
                'ThunderFuck',
                'Temon',
                '狼小魂',
                'any2000',
                '米野',
                'P2',
                'pregnant_3d',
                '白沢御飯',
                'ろくよん',
                'poop',
                'クロカジ',
                '鈴'
            ]
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
                    willyou = confirm('Already in the list, remove?');
                    if (willyou){
                        alert('Removed ' + theuser);
                        realshitlist.splice(x,1);
                        this.setArray(thelist, realshitlist );
                    } else {
                        alert('Keeping ' + theuser);
                    }
                    return true;
                }
            }
            
            //user wasn't in list
            willyou = confirm('Add to Filterlist?');
            if (willyou){
                realshitlist[realshitlist.length] = theuser;
                alert('Added ' + theuser);
                this.setArray(thelist, realshitlist );
                return true;
            }
            return false;
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
                u = testElements.item(v).childNodes[1].attributes['data-user_name'].value;
                
                //add +/- next to names
                coolspan = document.createElement('span');
                
                //if shit users
                if (PB_CFG.arrayContains(u, shitusers)) {
                    //testElements.item(v).parentNode.removeChild(testElements.item(v));
                    testElements.item(v).childNodes[0].innerHTML = 'This user is shit<br>';
                    
                    coolspan.className = "pixivblocker_minus";
                    coolspan.setAttribute("onclick", "PB_CFG.listManage('shitusers','"+u+"');");
                    coolspan.innerHTML = "❤";
                    coolspan.title = "Remove from pixivblocker";
                }
                else{
                    coolspan.className = "pixivblocker_plus";
                    coolspan.setAttribute("onclick", "PB_CFG.listManage('shitusers','"+u+"');");
                    coolspan.innerHTML = "🚫";
                    coolspan.title = "Add user to pixivblocker";
                }
                testElements.item(v).insertBefore(coolspan, testElements.item(v).childNodes[1].nextSibling);
            }
            
            //add list of shitusers at bottom of page
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
            coollist.innerHTML = "<h3>Shit users you've blocked:</h3>\r\n" + coollist.innerHTML;
            var targetcontainer = testElements.item(0).parentNode.parentNode;
            targetcontainer.insertBefore(coollist, targetcontainer.nextSibling);
        }
    };
}

function populateCSS(){
    var ourcss = "";

    ourcss += ".pixivblocker_minus { padding:0px 4px; background: #77FF88; color:#FFF; cursor:pointer;}";
    ourcss += ".pixivblocker_plus { padding:0px 4px; background: #FF7788; color:#FFF; cursor:pointer; margin-left:5px;}";
    ourcss += ".pixivblocker_shitusers { list-style: none; display:block; width:95%; margin:auto; margin-bottom: 15px; }";
    ourcss += ".pixivblocker_shitusers h3 { font-weight: bolder; }"
    ourcss += ".pixivblocker_shitusers li { padding-left:3px; display:inline-block; background: rgba(0,0,0,.1); margin:5px;}";
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

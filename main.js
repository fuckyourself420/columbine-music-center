const {app,BrowserWindow,ipcMain,dialog,nativeImage,Menu,shell}=require('electron');
const path=require('path'),fs=require('fs/promises'),fsx=require('fs'),crypto=require('crypto');
const UD=path.join(app.getPath('appData'),'cart3r-player');
app.setName('Columbine Music Center');app.setPath('userData',UD);
app.commandLine.appendSwitch('autoplay-policy','no-user-gesture-required');
const EXT=/\.(mp3|m4a|aac|flac|wav|aif|aiff|ogg|opus)$/i,LIB=()=>path.join(UD,'library.json'),CF=()=>path.join(UD,'lastfm.json');
let win,L={key:'',secret:'',sk:'',user:'',on:false,tok:'',q:[]};
const sv=()=>fs.writeFile(CF(),JSON.stringify(L));
async function loadL(){try{L={...L,...JSON.parse(await fs.readFile(CF(),'utf8'))}}catch{}}
async function lf(p,post){p={...p,api_key:L.key};const s=Object.keys(p).sort().map(k=>k+p[k]).join('')+L.secret;p.api_sig=crypto.createHash('md5').update(s,'utf8').digest('hex');p.format='json';
 const q=new URLSearchParams(p),r=await(post?fetch('https://ws.audioscrobbler.com/2.0/',{method:'POST',body:q}):fetch('https://ws.audioscrobbler.com/2.0/?'+q)),j=await r.json();
 if(j.error){const er=new Error(j.message||('error '+j.error));er.code=j.error;throw er}return j}
async function flush(){while(L.q.length&&L.sk){try{await lf({method:'track.scrobble',sk:L.sk,...L.q[0]},1);L.q.shift();await sv()}catch(e){if(e.code==6||e.code==13){L.q.shift();await sv()}else break}}}
function make(){win=new BrowserWindow({width:1320,height:860,minWidth:760,minHeight:520,backgroundColor:'#000000',titleBarStyle:'hiddenInset',trafficLightPosition:{x:14,y:11},webPreferences:{preload:path.join(__dirname,'preload.js'),contextIsolation:true}});win.loadFile('index.html')}
app.whenReady().then(async()=>{await loadL();
 Menu.setApplicationMenu(Menu.buildFromTemplate([{role:'appMenu'},{label:'File',submenu:[{label:'Add Music Folder…',accelerator:'CmdOrCtrl+O',click:()=>win&&win.webContents.send('add')},{role:'close'}]},{role:'editMenu'},{role:'viewMenu'},{role:'windowMenu'}]));
 make();flush().catch(()=>{});app.on('activate',()=>{if(!BrowserWindow.getAllWindows().length)make()})});
app.on('window-all-closed',()=>app.quit());
ipcMain.handle('load',async()=>{try{return JSON.parse(await fs.readFile(LIB(),'utf8'))}catch{return null}});
ipcMain.handle('save',(e,d)=>fs.writeFile(LIB(),JSON.stringify(d)));
ipcMain.handle('read',(e,p)=>fs.readFile(p));
function imgFor(pic,p){let im=pic&&pic[0]?nativeImage.createFromBuffer(Buffer.from(pic[0].data)):null;
 if(!im||im.isEmpty()){im=null;for(const nm of ['cover','folder','front','album'])for(const x of ['.jpg','.jpeg','.png']){const q=path.join(path.dirname(p),nm+x);if(!im&&fsx.existsSync(q))im=nativeImage.createFromPath(q)}}
 return im&&!im.isEmpty()?im:null}
ipcMain.handle('cover',async(e,p)=>{try{const {parseFile}=await import('music-metadata'),m=await parseFile(p),im=imgFor(m.common.picture,p);if(!im)return null;
 return 'data:image/jpeg;base64,'+(im.getSize().width>900?im.resize({width:900,quality:'best'}):im).toJPEG(88).toString('base64')}catch{return null}});
ipcMain.handle('scan',async(e,ps)=>{
 if(!ps){const r=await dialog.showOpenDialog(win,{title:'Add music folder',properties:['openDirectory','multiSelections']});if(r.canceled)return null;ps=r.filePaths}
 const files=[],walk=async p=>{let s;try{s=await fs.stat(p)}catch{return}if(s.isDirectory()){let ns=[];try{ns=await fs.readdir(p)}catch{return}for(const n of ns)if(!n.startsWith('.'))await walk(path.join(p,n))}else if(EXT.test(p))files.push(p)};
 for(const p of ps)await walk(p);
 const {parseFile}=await import('music-metadata'),tracks=[],covers={};let n=0;
 for(const p of files){
  const base=path.basename(path.dirname(p));let rec={path:p,title:'',art:'',aa:'',alb:base,g:'',y:0,no:0,disc:0,dur:1,bpm:0,key:'',miss:true,ck:'|'+base};
  try{const m=await parseFile(p,{duration:true}),c=m.common;
   rec={path:p,title:c.title||'',art:c.artist||'',aa:c.albumartist||'',alb:c.album||base,g:(c.genre||[]).join(', '),y:c.year||0,no:(c.track&&c.track.no)||0,disc:(c.disk&&c.disk.no)||0,dur:m.format.duration||1,bpm:Math.round(c.bpm||0),key:c.key||'',miss:!(c.title&&c.artist&&c.album&&c.genre&&c.genre.length&&c.year)};
   const k=(rec.aa||rec.art)+'|'+rec.alb;rec.ck=k;
   if(!covers[k]){const im=imgFor(c.picture,p);if(im)covers[k]='data:image/jpeg;base64,'+im.resize({width:240,quality:'good'}).toJPEG(80).toString('base64')}
  }catch(err){}
  try{rec.added=Math.round((await fs.stat(p)).mtimeMs)}catch{rec.added=0}
  tracks.push(rec);e.sender.send('prog',++n,files.length)}
 return {tracks,covers}});
ipcMain.handle('lfm',async(e,a,d)=>{try{
 if(a=='get')return{key:L.key,secret:!!L.secret,user:L.user,on:L.on,pending:!!L.tok,q:L.q.length};
 if(a=='cfg'){L.key=d.key.trim();if(d.secret.trim())L.secret=d.secret.trim();await sv();return 1}
 if(a=='auth'){const j=await lf({method:'auth.getToken'});L.tok=j.token;await sv();shell.openExternal('https://www.last.fm/api/auth/?api_key='+L.key+'&token='+L.tok);return 1}
 if(a=='finish'){const j=await lf({method:'auth.getSession',token:L.tok});L.sk=j.session.key;L.user=j.session.name;L.tok='';L.on=true;await sv();return 1}
 if(a=='out'){L.sk='';L.user='';L.on=false;await sv();return 1}
 if(a=='on'){L.on=!!d;await sv();return 1}
 if(a=='now'){if(L.on&&L.sk)await lf({method:'track.updateNowPlaying',sk:L.sk,...d},1);return 1}
 if(a=='scrobble'){if(L.on&&L.sk){L.q.push(d);await sv();await flush()}return 1}
}catch(err){return{err:err.message}}});

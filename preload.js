const {contextBridge,ipcRenderer,webUtils}=require('electron');
contextBridge.exposeInMainWorld('api',{
 scan:p=>ipcRenderer.invoke('scan',p),read:p=>ipcRenderer.invoke('read',p),load:()=>ipcRenderer.invoke('load'),save:d=>ipcRenderer.invoke('save',d),
 cover:p=>ipcRenderer.invoke('cover',p),lfm:(a,d)=>ipcRenderer.invoke('lfm',a,d),discordPresence:d=>ipcRenderer.invoke('discord-presence',d),discordClear:()=>ipcRenderer.invoke('discord-clear'),pathFor:f=>webUtils.getPathForFile(f),
 onProg:cb=>ipcRenderer.on('prog',(_,a,b)=>cb(a,b)),onAdd:cb=>ipcRenderer.on('add',()=>cb())});

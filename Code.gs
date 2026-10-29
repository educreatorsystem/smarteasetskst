/** SMART e-ASET SK Sungai Tiram — backend v1.
 * Akaun admin dikonfigurasi dengan hash kata laluan.
 * Jalankan kemaskiniAksesAdmin() untuk akaun yang diminta.
 * Kemudian deploy versi baharu sebagai Web App.
 * Execute as: Me; Who has access: Anyone. Semua data dilindungi token aplikasi.
 */
// Kata laluan tidak disimpan sebagai teks biasa.
const DEFAULT_ADMIN_HASH = {salt:'7eef0ea5-13da-4453-b25e-8e3d9e2db3cf',hash:'+i6zaK9EjsXFmtBNr/jGIrzlYSDgWh6CR+sxz6Gj5j8='};
const IMAGE_FOLDER_ID = '1dHL_ztMowHoKC3DthLu0ICJ5ZwayiJND';
const SHEET_ID = '1Io5vxJLqW3ezIH3y37ugp77LGYqmaBvPQqQQv51C0ZI';
const TABS = {assets:'EASET_ASSETS',locations:'EASET_LOCATIONS',loans:'EASET_LOANS',maintenance:'EASET_MAINTENANCE',moves:'EASET_MOVES',users:'EASET_USERS'};
const CONDITION=['Baik','Rosak','Dalam Penyelenggaraan'];
const CATEGORIES=['ICT','Perabot','Peralatan Pejabat','Peralatan PdP','Sukan','Kokurikulum','Lain-lain'];
function output_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON)}
function doGet(){return output_({ok:true,service:'SMART e-ASET',version:1,message:'Gunakan aplikasi dan log masuk untuk mengakses data.'})}
function setup(){
 const p=PropertiesService.getScriptProperties(),username=p.getProperty('ADMIN_USERNAME')||'admin',password=p.getProperty('ADMIN_PASSWORD');
 if(password&&password.length<10)throw Error('Kata laluan perlu sekurang-kurangnya 10 aksara.');
 const ss=SpreadsheetApp.openById(SHEET_ID);
 Object.values(TABS).forEach(n=>{let s=ss.getSheetByName(n);if(!s){s=ss.insertSheet(n);s.appendRow(['ID','JSON']);s.setFrozenRows(1)}});
 const users=read_('users');if(users.some(u=>u.role==='admin'))throw Error('Admin telah wujud. Gunakan aplikasi untuk mengurus pengguna.');
 const salt=password?Utilities.getUuid():DEFAULT_ADMIN_HASH.salt;users.push({id:Utilities.getUuid(),username:username.toLowerCase().trim(),name:p.getProperty('ADMIN_NAME')||'Admin SKST',role:'admin',salt,hash:password?hash_(password,salt):DEFAULT_ADMIN_HASH.hash});write_('users',users);
 if(!read_('locations').length)write_('locations',['Pejabat','Makmal Komputer','Bilik Sains','Bilik Sukan','Bilik Kokurikulum'].map(name=>({id:Utilities.getUuid(),name,archived:false})));
 p.deleteProperty('ADMIN_PASSWORD');
}
function read_(k){const s=SpreadsheetApp.openById(SHEET_ID).getSheetByName(TABS[k]);if(!s)throw Error('Jalankan setup() terlebih dahulu.');if(s.getLastRow()<2)return [];return s.getRange(2,2,s.getLastRow()-1,1).getValues().filter(r=>r[0]).map(r=>JSON.parse(r[0]))}
function write_(k,xs){const s=SpreadsheetApp.openById(SHEET_ID).getSheetByName(TABS[k]);const n=s.getLastRow();if(xs.length)s.getRange(2,1,xs.length,2).setValues(xs.map(x=>[x.id,JSON.stringify(x)]));if(n>xs.length+1)s.getRange(xs.length+2,1,n-xs.length-1,2).clearContent()}
function hash_(password,salt){return Utilities.base64Encode(Utilities.computeHmacSha256Signature(String(password),salt))}
function assert_(c,m){if(!c)throw Error(m)}
function required_(x,ks){ks.forEach(k=>assert_(typeof x[k]==='string'&&x[k].trim().length>0&&x[k].length<5000,'Medan wajib tidak sah: '+k))}
function day_(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(new Date(s+'T00:00:00Z').getTime())&&new Date(s+'T00:00:00Z').toISOString().slice(0,10)===s}
function admin_(u){assert_(u.role==='admin','Akses admin diperlukan.')}
function clean_(o,keys){const r={};keys.forEach(k=>{if(o[k]!==undefined){assert_(['string','number','boolean'].includes(typeof o[k]),'Jenis data tidak sah.');if(typeof o[k]==='string')assert_(o[k].length<12000,'Teks terlalu panjang.');r[k]=o[k]}});return r}
function data_(u){const d={};['assets','locations','loans','maintenance','moves'].forEach(k=>d[k]=read_(k));if(u.role!=='admin'){d.loans=d.loans.filter(l=>l.ownerId===u.id);d.maintenance=d.maintenance.filter(m=>m.ownerId===u.id);d.moves=[];d.assets=d.assets.filter(a=>!a.archived).map(a=>{const {id,reg,name,category,model,serial,location,condition,status,photo,archived}=a;return {id,reg,name,category,model,serial,location,condition,status,photo,archived}})}return d}
function doPost(e){let lock;try{
 assert_(e&&e.postData&&e.postData.contents.length<4500000,'Permintaan terlalu besar / tidak sah.');
 const q=JSON.parse(e.postData.contents),cache=CacheService.getScriptCache();
 if(q.action==='login'){
  const user=String(q.username||'').trim().toLowerCase(),key='fail:'+hash_(user,'login'),attempt=Number(cache.get(key)||0);assert_(attempt<10,'Terlalu banyak cubaan. Cuba lagi selepas 10 minit.');
  const u=read_('users').find(x=>x.username===user);if(!u||u.hash!==hash_(q.password||'',u.salt)){cache.put(key,String(attempt+1),600);throw Error('Nama pengguna atau kata laluan salah.')}
  cache.remove(key);const token=Utilities.getUuid()+Utilities.getUuid();cache.put('s:'+token,u.id,21600);return output_({ok:true,session:{token,name:u.name,role:u.role}})
 }
 const userId=cache.get('s:'+String(q.token||'')),u=read_('users').find(x=>x.id===userId);assert_(u,'Sesi tamat atau belum log masuk. Sila log masuk semula.');
 if(q.action==='logout'){cache.remove('s:'+q.token);return output_({ok:true})}
 if(q.action==='list')return output_({ok:true,data:data_(u)});
 if(q.action==='upload'){
  admin_(u);assert_(['image/jpeg','image/png','image/webp'].includes(q.mime),'Format gambar tidak dibenarkan.');assert_(typeof q.base64==='string'&&q.base64.length<=4194304,'Gambar melebihi 3 MB.');
  // Gunakan folder yang ditetapkan; jangan cipta folder pengganti.
  let folder;try{folder=DriveApp.getFolderById(IMAGE_FOLDER_ID);assert_(!folder.isTrashed(),'Folder telah dipadam.')}catch(err){throw Error('Folder gambar tidak dapat diakses. Pastikan pemilik deployment mempunyai akses editor kepada folder Drive yang ditetapkan.')}
  const bytes=Utilities.base64Decode(q.base64);assert_(bytes.length<=3*1024*1024,'Gambar terlalu besar.');
  const file=folder.createFile(Utilities.newBlob(bytes,q.mime,'ASET-'+Utilities.getUuid()+({'image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp'}[q.mime])));
  // Gambar aset mesti boleh dimuat oleh GitHub Pages. Pautan ini boleh dilihat sesiapa yang memilikinya.
  try{file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW)}catch(err){throw Error('Gambar telah dimuat naik ke folder yang ditetapkan tetapi pautan paparan tidak dapat dikongsi. Semak polisi perkongsian Google Workspace sebelum mengulang muat naik.')}
  return output_({ok:true,url:'https://drive.google.com/thumbnail?id='+file.getId()+'&sz=w1000'})
 }
 lock=LockService.getScriptLock();assert_(lock.tryLock(20000),'Pelayan sibuk. Cuba lagi.');
 const d=data_({role:'admin'}),get=id=>{const a=d.assets.find(x=>x.id===id);assert_(a,'Aset tidak ditemui.');return a};let changed=[];
 if(q.action==='user'){
  admin_(u);const v=q.user;required_(v,['username','password','name','role']);assert_(v.password.length>=10&&v.password.length<=200,'Kata laluan perlu 10–200 aksara.');assert_(['admin','guru'].includes(v.role),'Peranan tidak sah.');assert_(/^[a-zA-Z0-9_.-]{3,60}$/.test(v.username),'Nama pengguna tidak sah.');const users=read_('users'),name=v.username.toLowerCase(),old=users.find(x=>x.username===name);assert_(!(old&&old.id===u.id&&v.role!=='admin'),'Tidak boleh menurunkan peranan sendiri.');const salt=Utilities.getUuid(),obj={id:old?old.id:Utilities.getUuid(),username:name,name:v.name,role:v.role,salt,hash:hash_(v.password,salt)};if(old)Object.assign(old,obj);else users.push(obj);write_('users',users)
 }else if(q.action==='upsertAsset'){
  admin_(u);const a=clean_(q.asset,['id','reg','name','category','model','serial','acquired','price','source','supplier','location','officer','condition','status','warranty','photo','notes','archived']);required_(a,['id','reg','name','category','location','officer']);a.reg=a.reg.trim();a.name=a.name.trim();assert_(/^[\w-]{1,100}$/.test(a.id),'ID tidak sah.');assert_(day_(a.acquired),'Tarikh perolehan tidak sah.');assert_(a.price!==''&&Number.isFinite(Number(a.price))&&Number(a.price)>=0,'Harga tidak sah.');assert_(!a.warranty||day_(a.warranty),'Tarikh waranti tidak sah.');assert_(CATEGORIES.includes(a.category)&&CONDITION.includes(a.condition),'Kategori / keadaan tidak sah.');assert_(d.locations.some(l=>l.name===a.location&&!l.archived),'Lokasi tidak aktif.');assert_(!d.assets.some(x=>x.id!==a.id&&x.reg.toLowerCase()===a.reg.toLowerCase()),'Nombor daftar telah digunakan.');const old=d.assets.find(x=>x.id===a.id);assert_(['Tersedia','Tidak Aktif'].includes(a.status)||old&&old.status==='Dipinjam'&&a.status==='Dipinjam','Status tidak sah.');if(old){assert_(old.location===a.location,'Gunakan fungsi Pindah untuk lokasi.');assert_(!(old.status==='Dipinjam'&&a.status!=='Dipinjam'),'Gunakan fungsi Pemulangan.');assert_(!d.maintenance.some(m=>m.assetId===a.id&&m.status!=='Selesai')||a.condition==='Dalam Penyelenggaraan','Selesaikan penyelenggaraan dahulu.');Object.assign(old,a)}else{assert_(a.status!=='Dipinjam','Rekod pinjaman diperlukan.');a.archived=false;d.assets.push(a)}changed=['assets']
 }else if(q.action==='archiveAsset'){
  admin_(u);const a=get(q.id);assert_(!d.loans.some(l=>l.assetId===a.id&&!l.returned)&&!d.maintenance.some(m=>m.assetId===a.id&&m.status!=='Selesai'),'Selesaikan pinjaman / penyelenggaraan dahulu.');a.archived=!a.archived;changed=['assets']
 }else if(q.action==='location'){
  admin_(u);const l=clean_(q.location,['id','name','archived']);required_(l,['id','name']);l.name=l.name.trim();assert_(!d.locations.some(x=>x.id!==l.id&&x.name.toLowerCase()===l.name.toLowerCase()),'Nama lokasi telah digunakan.');const old=d.locations.find(x=>x.id===l.id);if(old){assert_(!l.archived||!d.assets.some(a=>!a.archived&&a.location===old.name),'Pindahkan aset aktif dahulu.');if(old.name!==l.name){d.assets.forEach(a=>{if(a.location===old.name)a.location=l.name});changed.push('assets')}Object.assign(old,l)}else d.locations.push(l);changed.push('locations')
 }else if(q.action==='move'){
  admin_(u);const m=clean_(q.move,['id','assetId','to','date','officer','notes']);required_(m,['id','assetId','to','date','officer']);const a=get(m.assetId);assert_(!a.archived&&a.status!=='Dipinjam','Aset tidak tersedia untuk dipindah.');assert_(day_(m.date)&&m.to!==a.location,'Tarikh / lokasi tidak sah.');assert_(d.locations.some(l=>!l.archived&&l.name===m.to),'Lokasi tidak aktif.');assert_(!d.moves.some(x=>x.id===m.id),'ID perpindahan telah digunakan.');m.from=a.location;a.location=m.to;d.moves.push(m);changed=['moves','assets']
 }else if(q.action==='loan'){
  const l=clean_(q.loan,['id','assetId','borrower','purpose','start','due','approver','notes']);required_(l,['id','assetId','borrower','purpose','start','due']);assert_(day_(l.start)&&day_(l.due)&&l.due>=l.start,'Tarikh pinjaman tidak sah.');assert_(!d.loans.some(x=>x.id===l.id),'ID pinjaman telah digunakan.');const a=get(l.assetId);assert_(!a.archived&&a.status==='Tersedia'&&a.condition==='Baik'&&!d.loans.some(x=>x.assetId===a.id&&!x.returned&&!x.pending),'Aset tidak tersedia.');l.ownerId=u.id;l.owner=u.name;l.returned='';l.borrowCondition='Baik';l.pending=u.role!=='admin';if(u.role==='admin'){required_(l,['approver']);a.status='Dipinjam'}else l.approver='';d.loans.push(l);changed=['loans','assets']
 }else if(q.action==='approveLoan'||q.action==='rejectLoan'){
  admin_(u);const l=d.loans.find(x=>x.id===q.id&&x.pending&&!x.returned);assert_(l,'Permohonan tidak ditemui.');if(q.action==='rejectLoan'){l.pending=false;l.returned=Utilities.formatDate(new Date(),'Asia/Kuala_Lumpur','yyyy-MM-dd');l.returnNotes='Permohonan ditolak';l.rejected=true}else{const a=get(l.assetId);assert_(!a.archived&&a.status==='Tersedia'&&a.condition==='Baik'&&!d.loans.some(x=>x.assetId===a.id&&!x.returned&&!x.pending),'Aset tidak lagi tersedia.');l.pending=false;l.approver=u.name;a.status='Dipinjam'}changed=['loans','assets']
 }else if(q.action==='return'){
  admin_(u);const l=d.loans.find(x=>x.id===q.id);assert_(l&&!l.returned&&!l.pending,'Pinjaman tidak aktif.');const r=clean_(q.returnData,['returned','returnCondition','returnNotes']);assert_(day_(r.returned)&&r.returned>=l.start,'Tarikh pulang tidak sah.');assert_(['Baik','Rosak'].includes(r.returnCondition),'Keadaan pemulangan tidak sah.');Object.assign(l,r);const a=get(l.assetId);a.status='Tersedia';a.condition=r.returnCondition;changed=['loans','assets']
 }else if(q.action==='maintenance'){
  const m=clean_(q.record,['id','assetId','date','description','photo','status','action','vendor','cost','completed','next','resultCondition']);required_(m,['id','assetId','date','description']);assert_(day_(m.date),'Tarikh aduan tidak sah.');const old=d.maintenance.find(x=>x.id===m.id);if(old)admin_(u);if(u.role!=='admin'){m.status='Baharu';m.cost=0;m.action='';m.vendor='';m.completed='';m.next='';m.resultCondition='Rosak'}assert_(['Baharu','Dalam Tindakan','Selesai'].includes(m.status),'Status tidak sah.');assert_(Number.isFinite(Number(m.cost))&&Number(m.cost)>=0,'Kos tidak sah.');assert_(!m.next||day_(m.next)&&m.next>=m.date,'Tarikh seterusnya tidak sah.');if(m.status==='Selesai')assert_(day_(m.completed)&&m.completed>=m.date&&['Baik','Rosak'].includes(m.resultCondition),'Tarikh siap / keadaan diperlukan.');assert_(!old||old.assetId===m.assetId,'Tidak boleh menukar aset aduan.');const a=get(m.assetId);assert_(!a.archived&&a.status!=='Dipinjam','Aset tidak tersedia.');if(old)Object.assign(old,m);else {m.ownerId=u.id;d.maintenance.push(m)}a.condition=d.maintenance.some(x=>x.assetId===a.id&&x.status!=='Selesai')?'Dalam Penyelenggaraan':m.resultCondition;changed=['maintenance','assets']
 }else throw Error('Tindakan tidak dikenali.');
 changed.forEach(k=>write_(k,d[k]));return output_({ok:true,data:data_(u)});
 }catch(x){return output_({ok:false,error:String(x.message||x)})}finally{if(lock)lock.releaseLock()}}

/** Jalankan secara manual dari editor Apps Script untuk mengemas kini akaun admin. */
function kemaskiniAksesAdmin(){
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const ss=SpreadsheetApp.openById(SHEET_ID);
  Object.values(TABS).forEach(n=>{if(!ss.getSheetByName(n)){const s=ss.insertSheet(n);s.appendRow(['ID','JSON']);s.setFrozenRows(1)}});
  const users=read_('users'),old=users.find(u=>u.username==='admin');
  const record={id:old?old.id:Utilities.getUuid(),username:'admin',name:old?old.name:'Admin SK Sungai Tiram',role:'admin',salt:DEFAULT_ADMIN_HASH.salt,hash:DEFAULT_ADMIN_HASH.hash};
  if(old)Object.assign(old,record);else users.push(record);
  write_('users',users);
  if(!read_('locations').length)write_('locations',['Pejabat','Makmal Komputer','Bilik Sains','Bilik Sukan','Bilik Kokurikulum'].map(name=>({id:Utilities.getUuid(),name,archived:false})));
  // Rekod aset, pinjaman, penyelenggaraan dan pengguna lain dikekalkan.
 }finally{lock.releaseLock()}
}

/** Jalankan secara manual untuk menyemak akses folder tanpa mengubah akaun/data. */
function semakFolderGambar(){
 const folder=DriveApp.getFolderById(IMAGE_FOLDER_ID);
 assert_(!folder.isTrashed(),'Folder gambar telah dipadam.');
 console.log('Folder gambar dapat dibaca: '+folder.getName()+'. Uji satu muat naik melalui aplikasi untuk mengesahkan kebenaran menulis.');
}

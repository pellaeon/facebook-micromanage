var Db = new Dexie("fbmicromanage");
Db.version(1).stores({
	person: 'fbuid,name,lastcrawl',
	post: 'id,content,text,updated,author'
});

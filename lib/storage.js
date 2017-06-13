let db = new zango.Db('fbmicromanage', {
	person: ['fbuid', 'name', 'lastcrawl'],
	post: ['id', 'content', 'text', 'updated', 'author'],
});

let Person = db.collection('person');
let Post = db.collection('post');

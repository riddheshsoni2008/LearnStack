const { MongoClient } = require('mongodb');

async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('learnstack');
    
    const user = await db.collection('users').findOne({ email: 'riddheshsoni008@gmail.com' });
    
    if (user) {
      console.log('User found:', user.email);
      console.log('Password hash looks like bcrypt?', user.password && user.password.startsWith('$2'));
      console.log('Raw password field:', user.password);
    } else {
      console.log('User riddheshsoni008@gmail.com DOES NOT EXIST in local learnstack database');
      
      const allUsers = await db.collection('users').find({}).project({ email: 1 }).toArray();
      console.log('Available users in local DB:', allUsers.map(u => u.email));
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

run();

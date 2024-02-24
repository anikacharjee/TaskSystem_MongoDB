const { MongoClient } = require('mongodb');

async function TaskManagement() {
  const uri = 'mongodb://localhost:27017';
  const dbName = 'TaskDatabase';

  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collectionName = 'myTasks';

    // Check if the collection already exists
    const collectionExists = await db.listCollections({ name: collectionName }).hasNext();

    if (!collectionExists) {
      // Validation rules for tasks
      const validationRules = {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'description', 'status', 'priority'],
            properties: {
              title: { bsonType: 'string' },
              description: { bsonType: 'string' },
              status: { enum: ['pending', 'completed'] },
              priority: { bsonType: 'int', minimum: 1 }
            }
          }
        }, 
        validationAction: 'error'
      };

      // Create collection 'tasks' with validation rules
      await db.createCollection(collectionName, validationRules);
      console.log(`Collection '${collectionName}' created with validation rules.`);
    } else {
      console.log(`Collection '${collectionName}' already exists. Skipping creation.`);
    }

   const tasksToInsert = [
    {
      title: 'Complete Project 1',
      description: 'Finish the coding project by the end of this week.',
      status: 'pending',
      priority: 1
    },
    {
      title: 'Complete Project 2',
      description: 'Submit the project documentation.',
      status: 'completed',
      priority: 2
    },
    {
      title: 'Complete Project 3',
      description: 'Starting Testing stage.',
      status: 'pending',
      priority: 3
    }
   ];

   const InsertResult = await db.collection(collectionName).insertMany(tasksToInsert);
   console.log(`Inserted ${InsertResult.insertedCount} documents with IDs`, InsertResult.insertedIds);


   const query = {
    status: { $in: ['pending', 'completed']},
    priority: {$lte: 2}
   };

   const filteredTasks = await db.collection(collectionName).find(query).toArray();
   console.log('Filtered tasks: ', filteredTasks);

   //Updating the document(s)
   const updateResult = await db.collection(collectionName).updateOne(
    {title: 'Complete Project 1'},
    {$set: {status: 'completed'}}
   );

   console.log(`Task Updated : ${updateResult.modifiedCount} document(s)`);

   //Read Updated Task
   const findUpdatedResult = await db.collection(collectionName).findOne({title: 'Complete Project 1'});
   console.log('Updated Task fetched :', findUpdatedResult);

   //Delete Document
   const deleteResult = await db.collection(collectionName).deleteOne({title: 'Complete Project 3'});
   console.log(`Task Deleted : ${deleteResult.deletedCount} document(s)`);


  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run CRUD operations for tasks
TaskManagement().catch(console.error);

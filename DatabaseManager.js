class Database
{
    static async Connect()
    {
        let { MongoClient, ServerApiVersion } = require('mongodb'); 
        let client = new MongoClient(process.env.MONGODB_URI, 
          {
          serverApi: 
          {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
          }
        });
        
        async function run() 
        {           
            await client.connect();       
            await client.db("database0").command({ ping: 1 });     
        }
        run().catch(console.dir);
        return client;
    }

    static async CreateNewTable(tableName) 
    {
        let client = await this.Connect();
        try 
        {
            let database = client.db();
            await database.createCollection(tableName);
        } catch (err) 
        {
            console.error(err);
        } finally 
        {
            await client.close();
        }
    }

    static async DropTable(tableName) 
    {
        const client = await this.Connect();
        try 
        {
            let database = client.db();
            await database.collection(tableName).drop();
        } catch (err) 
        {
            console.error(err);
        } finally 
        {
            await client.close();
        }
    }

    static async Insert(tableName, data) 
    {
        let client = await this.Connect();
        try 
        {
            let database = client.db();
            let collection = database.collection(tableName);
            await collection.insertOne(data);
        } catch (err) 
        {
            console.error(err);
        } finally 
        {
            await client.close();
        }
    }

    static async Delete(tableName, filter) 
    {
        let client = await this.Connect();
        try 
        {
            let database = client.db();
            let collection = database.collection(tableName);
            await collection.deleteOne(filter);
        } catch (err) 
        {
            console.error(err);
        } finally 
        {
            await client.close();
        }
    }

    static async GetAllTables() 
    {
        const client = await this.Connect();
        try 
        {
            let database = client.db();
            let collections = await database.listCollections().toArray();
            let tableNames = collections.map(collection => collection.name);
            console.log("Tables:", tableNames);
            return tableNames;
        } catch (err) 
        {
            console.error(err);
        } finally 
        {
            await client.close();
        }
    }

    static async SelectAll(tableName,limit) 
    {
        const client = await this.Connect();
        try 
        {
            let database = client.db();
            let collection = database.collection(tableName);
            let data = await collection.find({}).limit(limit).toArray();
            return data;
        } catch (err) 
        {
            console.error(err);
        } finally 
        {
            await client.close();
        }
    }

    static async Select(tableName,filter) 
    {
        const client = await this.Connect();
        try 
        {
            let database = client.db();
            let collection = database.collection(tableName);
            let data = await collection.find(filter).toArray();
            return data;
        } catch (err) 
        {
            console.error(err);
        } finally 
        {
            await client.close();
        }
    }


    static async Update(tableName, filter, update) 
    {
        const client = await this.Connect();
        try 
        {
            const database = client.db();
            const collection = database.collection(tableName);
            await collection.updateOne(filter, { $set: update });
        } catch (err) 
        {
            console.error(err);
        } finally 
        {
            await client.close();
        }
    }

    
}
module.exports = Database;
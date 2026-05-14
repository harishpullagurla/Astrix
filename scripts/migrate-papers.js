const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI not found");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB for migration...");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (collectionNames.includes('papers')) {
      console.log("Found legacy 'papers' collection. Migrating to 'resources'...");
      
      const papers = await db.collection('papers').find({}).toArray();
      console.log(`Found ${papers.length} legacy papers.`);

      if (papers.length > 0) {
        const migratedResources = papers.map(paper => {
          // Map old examType to new resourceType
          let resourceType = paper.examType;
          if (resourceType === 'Mid-Sem') resourceType = 'Mid-Sem Paper';
          if (resourceType === 'End-Sem') resourceType = 'End-Sem Paper';
          if (!resourceType) resourceType = 'Other';

          const { examType, ...rest } = paper;
          return {
            ...rest,
            resourceType,
            status: paper.status || 'approved'
          };
        });

        // Insert into new collection if it doesn't exist or merge
        await db.collection('resources').insertMany(migratedResources);
        console.log(`Successfully migrated ${migratedResources.length} papers to resources.`);
        
        // Optional: Rename the old collection instead of deleting to be safe
        await db.collection('papers').rename('papers_legacy_' + Date.now());
        console.log("Renamed legacy 'papers' collection.");
      }
    } else {
      console.log("No legacy 'papers' collection found.");
    }

    // Update Unlocks to ensure they point to valid IDs if needed
    // (In our case, we kept IDs the same so Unlock.paper will still match Resource._id)

    console.log("Migration complete!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await mongoose.connection.close();
  }
}

migrate();

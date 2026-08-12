const { sequelize } = require('./src/config/db.js');
sequelize.query(`
  ALTER TABLE products 
  ALTER COLUMN image TYPE JSON 
  USING CASE 
    WHEN image IS NULL OR image = '' THEN '[]'::json 
    ELSE concat('["', image, '"]')::json 
  END;
`)
.then(() => {
  console.log('Done');
  process.exit(0);
})
.catch(e => {
  console.error(e);
  process.exit(1);
});

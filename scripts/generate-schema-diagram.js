/**
 * Schema Diagram Generator
 * Generates database schema diagrams
 */

const { exec } = require('child_process');
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');

const execAsync = promisify(exec);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

// Load environment variables
require('dotenv').config();

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME || 'communityio';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';

// Create diagrams directory if it doesn't exist
const DIAGRAMS_DIR = path.join(__dirname, '..', 'docs', 'diagrams');

async function generateSchemaDoc() {
  try {
    // Ensure diagrams directory exists
    await mkdirAsync(DIAGRAMS_DIR, { recursive: true });
    
    // Generate schema documentation
    console.log('Generating database schema documentation...');
    
    // Generate schema SQL
    const { stdout: schemaSQL } = await execAsync(
      `pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} --schema-only`
    );
    
    // Save SQL file
    const sqlFilePath = path.join(DIAGRAMS_DIR, 'schema.sql');
    await writeFileAsync(sqlFilePath, schemaSQL);
    console.log(`Schema SQL saved to ${sqlFilePath}`);
    
    // Generate mermaid diagram
    console.log('Generating entity relationship diagram...');
    await generateERDiagram();
    
    console.log('Schema documentation completed successfully.');
  } catch (error) {
    console.error('Error generating schema documentation:', error);
    process.exit(1);
  }
}

async function generateERDiagram() {
  try {
    // Query database for table information
    const { stdout: tableData } = await execAsync(`
      psql -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -c "
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable,
          column_default,
          CASE 
            WHEN pk.contype = 'p' THEN 'PK'
            WHEN pk.contype = 'f' THEN 'FK'
            ELSE NULL
          END AS constraint_type,
          ccu.table_name as referenced_table,
          ccu.column_name as referenced_column
        FROM information_schema.columns c
        LEFT JOIN (
          SELECT 
            conname,
            conrelid::regclass::text as table_name,
            conkey,
            confrelid::regclass::text as ftable,
            confkey,
            contype
          FROM pg_constraint
        ) pk ON 
          pk.table_name = c.table_name AND 
          array_position(pk.conkey, c.ordinal_position) IS NOT NULL
        LEFT JOIN information_schema.constraint_column_usage ccu ON
          pk.contype = 'f' AND
          pk.conname = ccu.constraint_name
        WHERE c.table_schema = 'public'
        ORDER BY c.table_name, c.ordinal_position
      " -t
    `);
    
    // Parse the data
    const tables = {};
    const relationships = [];
    
    tableData.split('\n').forEach(line => {
      const parts = line.trim().split('|').map(p => p.trim());
      if (parts.length < 6) return;
      
      const [tableName, columnName, dataType, isNullable, columnDefault, constraintType, referencedTable, referencedColumn] = parts;
      
      if (!tableName || !columnName) return;
      
      // Initialize table if it doesn't exist
      if (!tables[tableName]) {
        tables[tableName] = [];
      }
      
      // Add column to table
      tables[tableName].push({
        name: columnName,
        type: dataType,
        nullable: isNullable === 'YES',
        default: columnDefault,
        constraintType
      });
      
      // Add relationship if this is a foreign key
      if (constraintType === 'FK' && referencedTable && referencedColumn) {
        relationships.push({
          source: tableName,
          target: referencedTable,
          sourceColumn: columnName,
          targetColumn: referencedColumn
        });
      }
    });
    
    // Generate Mermaid ERD
    let mermaidERD = 'erDiagram\n';
    
    // Add tables
    Object.entries(tables).forEach(([tableName, columns]) => {
      mermaidERD += `    ${tableName} {\n`;
      
      columns.forEach(column => {
        const constraints = [];
        if (column.constraintType === 'PK') constraints.push('PK');
        if (!column.nullable) constraints.push('NOT NULL');
        
        mermaidERD += `        ${column.type} ${column.name} ${constraints.join(' ')}\n`;
      });
      
      mermaidERD += '    }\n\n';
    });
    
    // Add relationships
    relationships.forEach(rel => {
      // Determine cardinality (simplified)
      mermaidERD += `    ${rel.target} ||--o{ ${rel.source} : \"has\"\n`;
    });
    
    // Save Mermaid ERD file
    const erdFilePath = path.join(DIAGRAMS_DIR, 'erd.mmd');
    await writeFileAsync(erdFilePath, mermaidERD);
    console.log(`Entity relationship diagram saved to ${erdFilePath}`);
    
    return erdFilePath;
  } catch (error) {
    console.error('Error generating ER diagram:', error);
    throw error;
  }
}

// Run the generator
generateSchemaDoc().catch(console.error);
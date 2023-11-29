const express = require('express');
const path = require('path');
const engine = require('ejs-mate');
const mysql = require('mysql2');
const { env } = require('process');
const dotenv = require('dotenv').config();


const app = express();
const port = process.env.PORT || 3001;

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const li = 9.869371247975462;
const ji = 2.3245404961686953;
const plri = 0.012753777393574861;

const connection = mysql.createConnection({
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASS,
   database: process.env.DB_NAME
});

app.use(express.json());

connection.connect((err) => {
   if (err) throw err;
   console.log('Connected to MySQL Server!');
});


/**
 * routes
 */
app.get('/map/', (_req, res) => {
      res.render('index');
});

app.get('/', (_req, res) => {
   res.render('home'); 
});

app.get('/download', (req, res) => {
   const file = `${__dirname}/public/downloads/RateNET.apk`;
   res.download(file); // Set disposition and send it.
});




app.post('/mos/receive-json', (req, res) => {
   const jsonData = req.body;
   console.log(jsonData);

   const { network_information } = req.body;
   const tableName = network_information.operatorName.toLowerCase() + "_mos";

   const tableExistsQuery = `
      SELECT COUNT(*)
      FROM information_schema.tables 
      WHERE table_schema = '${process.env.DB_NAME}' 
      AND table_name = '${tableName}';
   `;

   connection.query(tableExistsQuery, (err, result) => {
   if (err) throw err;

      const tableExists = result[0]['COUNT(*)'] > 0;
      if (!tableExists) {
         // Create table based on the JSON structure
         const createTableQuery = `
            CREATE TABLE ${tableName} (
               id INT AUTO_INCREMENT PRIMARY KEY,
               fullname VARCHAR(255),
               phone VARCHAR(255),
               latency FLOAT,
               packetLoss FLOAT,
               jitter FLOAT,
               networkName VARCHAR(50),
               rssi INT,
               latitude FLOAT,
               longitude FLOAT,
               rating FLOAT,
               calc_mos FLOAT
            );
         `;
         connection.query(createTableQuery, (err) => {
            if (err) throw err;
            console.log('Table created successfully: ' + tableName);
         });
      }

      // Calculate MOS
      const MOS = calcularMOS(
         req.body.MOS.latency,
         req.body.MOS.jitter,
         req.body.MOS.packetLoss,
         li,
         ji,
         plri
      );
      console.log('MOS: ' + MOS);

      // Insert data into the table
      const insertDataQuery = `
      INSERT INTO ${tableName} (fullname, phone, latency, packetLoss, jitter, networkName, rssi, latitude, longitude, rating, calc_mos) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
      const values = [
         req.body.user.fullname,
         req.body.user.phone,
         req.body.MOS.latency,
         req.body.MOS.packetLoss,
         req.body.MOS.jitter,
         req.body.network_information.networkName,
         req.body.network_information.rssi,
         req.body.location.latitude,
         req.body.location.longitude,
         req.body.MOS.rating,
         MOS
      ];

      connection.query(insertDataQuery, values, (err) => {
         if (err) throw err;
         console.log('Data inserted successfully');
         res.send('Data inserted successfully');
      });
   });
});

function calcularMOS(latencia, jitter, packetLoss, li, ji, plri) {
   // Asegúrate de que los valores sean números
   latencia = Number(latencia);
   jitter = Number(jitter);
   packetLoss = Number(packetLoss);
   li = Number(li);
   ji = Number(ji);
   plri = Number(plri);

   // Calcula e^(plr * plri) para usar en la fórmula
   const exponente = Math.exp(packetLoss * plri);

   // Calcula el MOS según la fórmula
   const MOS = 0.999 + (4000 / (1 + (latencia * li + jitter * ji) * exponente));

   return MOS;
} 

app.get('/get-map-data', (req, res) => {
   const tableName = req.query.table;
   const columnName = req.query.column;
   const query = `SELECT latitude, longitude, ${columnName} FROM ${tableName}`;
   connection.query(query, (err, result) => {
      if(err) {
         console.log(err);
         res.status(500).send("Error fetching data");
      } else{
         res.json(result);
      }
   });
});


app.get('/get-table-names', (req, res) => {
   const query = `SHOW TABLES`;
   connection.query(query, (err, result) => {
      if(err) {
         console.log(err);
         res.status(500).send("Error fetching tables name");
      } else{
         const tableNames = result.map(row => Object.values(row)[0]);
         res.json(tableNames);
      }
   });
});


app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
      console.log(`Server is up on port ${port}`);
});

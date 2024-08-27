const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

// const JSONBIN_API_KEY = '$2a$10$kRQIhlSrix2niS2jmtxhzOn7q.Di5k1nndVSKbSjPJ.NUJPq4Xe4m';
// const JSONBIN_ENDPOINT = 'https://api.jsonbin.io/v3/b/66a26a9dacd3cb34a86b2d02';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT}/${process.env.PGDATABASE}`,
    ssl: {
        rejectUnauthorized: false
    }
});




app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Render the main page

app.get('/', (req, res) => {
    res.render('welcome');
});

app.get('/start', (req, res) => {
    res.render('index', { htmlCode: '', cssCode: '', jsCode: '' });
});

// Handle saving projects
app.post('/save', async (req, res) => {
    const { projectName, htmlCode, cssCode, jsCode } = req.body;

    try {
        const query = `
            INSERT INTO projects (project_name, html_code, css_code, js_code)
            VALUES ($1, $2, $3, $4)
        `;
        await pool.query(query, [projectName, htmlCode, cssCode, jsCode]);
        res.redirect('/projects');
    } catch (error) {
        console.error('Error saving project:', error);
        res.status(500).json({ message: 'Failed to save the project.' });
    }
});


// Route to render the projects page
app.get('/projects', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM projects');
        const projects = result.rows;
        res.render('projects', { projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Failed to fetch projects.' });
    }
});


// Route to open a project in Coderoom
app.get('/open/:projectName', async (req, res) => {
    const projectName = req.params.projectName;

    try {
        const result = await pool.query('SELECT * FROM projects WHERE project_name = $1', [projectName]);
        const project = result.rows[0];

        if (!project) {
            return res.status(404).send('Project not found');
        }

        res.render('index', {
            htmlCode: project.html_code || '',
            cssCode: project.css_code || '',
            jsCode: project.js_code || ''
        });
    } catch (error) {
        console.error('Error opening project:', error);
        res.status(500).json({ message: 'Failed to open the project.' });
    }
});


// Handle deleting projects
app.post('/delete/:projectName', async (req, res) => {
    const projectName = req.params.projectName;

    try {
        await pool.query('DELETE FROM projects WHERE project_name = $1', [projectName]);
        res.redirect('/projects');
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Failed to delete the project.' });
    }
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


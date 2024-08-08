const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();

const JSONBIN_API_KEY = '$2a$10$kRQIhlSrix2niS2jmtxhzOn7q.Di5k1nndVSKbSjPJ.NUJPq4Xe4m';
const JSONBIN_ENDPOINT = 'https://api.jsonbin.io/v3/b/66a26a9dacd3cb34a86b2d02';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

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
    const newProject = { projectName, htmlCode, cssCode, jsCode };

    try {
        // Fetch existing projects from JSONBin
        const response = await axios.get(JSONBIN_ENDPOINT, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });

        const existingProjects = response.data.record.projects || [];
        existingProjects.push(newProject);

        // Save updated projects back to JSONBin
        await axios.put(JSONBIN_ENDPOINT, { projects: existingProjects }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            }
        });

        res.redirect('/projects');
    } catch (error) {
        console.error('Error saving project:', error);
        res.status(500).json({ message: 'Failed to save the project.' });
    }
});

// Route to render the projects page
app.get('/projects', async (req, res) => {
    try {
        const response = await axios.get(JSONBIN_ENDPOINT, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        const projects = response.data.record.projects || [];
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
        const response = await axios.get(JSONBIN_ENDPOINT, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });
        const projects = response.data.record.projects || [];

        const project = projects.find(proj => proj.projectName === projectName);

        if (!project) {
            return res.status(404).send('Project not found');
        }

        res.render('index', {
            htmlCode: project.htmlCode || '',
            cssCode: project.cssCode || '',
            jsCode: project.jsCode || ''
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
        const response = await axios.get(JSONBIN_ENDPOINT, {
            headers: { 'X-Master-Key': JSONBIN_API_KEY }
        });

        let projects = response.data.record.projects || [];
        projects = projects.filter(proj => proj.projectName !== projectName);

        // Save updated projects back to JSONBin
        await axios.put(JSONBIN_ENDPOINT, { projects }, {
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY
            }
        });

        res.redirect('/projects');
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Failed to delete the project.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

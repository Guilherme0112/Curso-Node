const express = require('express');
const app = express();
const multer = require('multer');
const crypto = require('crypto');

const router = express.Router();

// Controllers
const PostsController = require('../controllers/PostsController');
const EditarPostagemController = require('../controllers/EditarPostagemController');

// Tratamento de imagem
const storagePost = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/posts/');
    },
    filename: (req, file, cb) => {
        var nameArquivo = crypto.randomBytes(16).toString('hex');
        var extencao = file.originalname.split('.').pop();

        cb(null, nameArquivo + '.' + extencao);
    },
    fileFilter: (req, file, cb) =>{
        const tiposDeImagem = ['image/jpg', 'image/png', 'image/jpeg'];
        if(tiposDeImagem.includes(file.mimetype)){
            cb(null, true);
        } else {
            cb(new Error('Somente JPEG, JPG e PNG são aceitos'))
        }
    }
});
const uploadPost = multer({ storage: storagePost });

// Criar postagem
router.get('/criar', PostsController.criarPostagemGET);
router.post('/criar', uploadPost.single('foto'), PostsController.criarPostagemPOST);

// Editar postagem
router.post('/editar', EditarPostagemController.editarPostagemPOST);

// Deletar postagem
router.post('/deletar', EditarPostagemController.deletarPostagem)

// Página de Postagem
router.get('/:id', PostsController.postagemPage);

module.exports = router;
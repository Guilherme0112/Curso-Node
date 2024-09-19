const con = require('../database/db_connection');
const { promisify } = require('util');
const conQuery = promisify(con.query).bind(con);
const bcryptjs = require('bcryptjs');

const editarPerfilGET = async (req, res) => {
    if(req.session.user){
        const idUser = req.session.user.id;

        const user = await conQuery("SELECT nome, foto, email, criado FROM users WHERE id = ? LIMIT 1", [idUser]);

        if(user){
            return res.render('editarPerfil', { user });
        }
        return res.redirect('/perfil');
    }
    return res.redirect('/');
}


const editarPerfilPOST = async(req, res) => {
    if(req.session.user){
        var nome = req.body.nomeJSON;
        var bio = req.body.bioJSON;
        var img = req.body.imgJSON;

        // console.log(nome, bio, img);
        console.log(req.body);

        if(nome){
            const sql = await conQuery("UPDATE users SET nome = ? WHERE id = ? ", [nome, req.session.user.id]);
        }
        if(bio){
            const sql = await conQuery("UPDATE users SET bio = ? WHERE id = ? ", [bio, req.session.user.id]);
        }
        // if(img){
        //     const sql = await conQuery("UPDATE users SET foto = ? WHERE id = ? ", [img, req.session.user.id]);
        // }

        return res.json({
            status: 200,
            redirect: '/perfil'
        })
    }
}

const delConta = async (req, res) => {
    if(req.session.user){
        const delConta = req.body.conta;
        const senha = req.body.senha;
        // console.log(req.body);

    // Verifica se é realmente para apagar a conta

        if(delConta === true){
            try{
                const verifyUser = await conQuery("SELECT * FROM users WHERE id = ?", [req.session.user.id]);
                // console.log(verifyUser);
                if(verifyUser){
                    var verifySenha = await bcryptjs.compare(senha, verifyUser[0].senha);
                    if(verifySenha){
                
                        const idUser = req.session.user.id;

                        // Apaga os comentários, likes, deslikes do usuario

                        const tabelas = ['likes', 'dislikes', 'comentarios', 'criador'];

                        for(var tabela of tabelas){

                            var sqlDel = await conQuery("DELETE FROM " + tabela + " WHERE idUser = ?",  [idUser]);
                        }

                        const conta = await conQuery("DELETE FROM users WHERE id = ?", [idUser]);
                        const posts = await conQuery("DELETE FROM postagens WHERE idUsuario = ?", [idUser]);

                        // Destrói a sessão

                        req.session.destroy(async (err) => {
                            if (err) {
                                console.log(err)
                            } 

                            return res.json({
                                status: 200,
                                redirect: '/login'
                            })

                        })
                    } else {
                        
                        return res.json({status: 250});
                    }
                }
            } catch (error){
                return res.json({status: "Erro ao apagar a conta: " + error});
            }
        }
    }
}

module.exports = { editarPerfilGET, delConta, editarPerfilPOST };
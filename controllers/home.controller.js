exports.getHomePage = (req,res) =>{
    let query = 'SELECT * FROM player ORDER BY id ASC';

    db.execute(query,(err,result)=>{
        if(err){
            res.redirect('/');
        }

        res.render('index.ejs',{
            title: 'Welcome to socka | View Players',
            player:result
        })
    });
    
    
}
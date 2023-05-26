const router=require('express').Router()
router.get('/',(req,res,next)=>{
   // res.send('Hello world');
   res.render('index');
});

module.exports=router
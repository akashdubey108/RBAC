const router=require('express').Router();

router.get('/profile',async(req,res,next)=>{
   // res.send('User Profile');
  const person=req.user;
  console.log(person)
   res.render('./profile',{person});
});

module.exports=router;
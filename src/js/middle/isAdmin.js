module.exports = function(req,res,next){
	req.user.isAdmin =(req.user.role.indexOf('admin')!=-1);
	next();
}
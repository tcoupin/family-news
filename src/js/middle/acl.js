function needUser(){
	return function(req,res,next){
		if (req.user === undefined){
			res.redirect('/login?path='+req.path);
		} else {
			next();
		}
	};
}
function needValidUser(){
	return function(req,res,next){
		if (req.user.role === undefined || req.user.role.length == 0){
			res.status(402).render('errors/402',conf.view);
		} else {
			next();
		}
	}
}
function needRole(role){
	return function(req,res,next){
		if (req.user.role.indexOf(role) == -1){
			res.status(200).render('errors/403',conf.view);
		} else {
			next();
		}
	}
}
module.exports = {
	needUser: needUser,
	needValidUser: needValidUser,
	needRole: needRole
}
import '../imports/ui/body.js';


FlowRouter.route('/compare/', {
	name: 'compare',
	action(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'compare'});
	}
});

FlowRouter.route('/home', {
	name: 'home',
	action(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'home'});
	}
});

FlowRouter.route('/compare/', {
	name: 'compare',
	action(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'compare'});
	}
});

FlowRouter.route('/dashboard/', {
	name: 'dashboard',
	action(params, queryParams) {
        BlazeLayout.render('App_body', {main: 'dashboard'});
	}
});

FlowRouter.route('/', {
	action(params, queryParams) {
	  FlowRouter.go('dashboard', params , queryParams);
	}
});
from authentication.forms import *
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.core.urlresolvers import reverse_lazy
from django.utils.decorators import method_decorator
from django.views.generic.edit import UpdateView, FormView


class LoginRequiredViewMixin(object):
    """
    Replaces the login_required() decorator of function-based views
    """
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(LoginRequiredViewMixin, self).dispatch(*args, **kwargs)


class UserUpdate(LoginRequiredViewMixin, UpdateView):
    model = User
    success_url = reverse_lazy('index')
    form_class = UserForm

    def get_object(self):
        return self.request.user


class UserSignup(FormView):
    template_name = 'auth/signup.html'
    form_class = SignupForm
    success_url = reverse_lazy('index')

    def form_valid(self, form):
        form.save()
        user = authenticate(username=form.cleaned_data['username'], password=form.cleaned_data['password1'])
        login(self.request, user)
        return super(UserSignup, self).form_valid(form)
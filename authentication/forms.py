from django import forms
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _
from django.core.exceptions import ValidationError

class UserForm(forms.ModelForm):
    """
    A limited user form
    """

    old_password = forms.CharField(label=_(u'Old password'), required=False, widget=forms.PasswordInput())
    new_password1 = forms.CharField(label=_(u'New password'), required=False, widget=forms.PasswordInput())
    new_password2 = forms.CharField(label=_(u'Repeat new password'), required=False, widget=forms.PasswordInput())

    def clean(self):
        cleaned_data = super(UserForm, self).clean()
        old_password = cleaned_data.get("old_password")
        new_password1 = cleaned_data.get("new_password1")
        new_password2 = cleaned_data.get("new_password2")

        if old_password or new_password1 or new_password2:

            if not (old_password and new_password1 and new_password2):
                raise ValidationError(_(u'To change password, you have to fill all password fields.'))

            if not self.instance.check_password(old_password):
                raise ValidationError(_(u'The old password you have entered is not correct.'))

            if not new_password1 == new_password2:
                raise ValidationError(_(u'New passwords are not matching.'))

        return cleaned_data

    def save(self, commit=True):
        instance = super(UserForm, self).save(False)
        instance.set_password(self.cleaned_data['new_password1'])

        if commit:
            instance.save()

        return instance

    class Meta:
        model = User
        fields = ['email']

class SignupForm(forms.Form):
    """
    Form for registering a new user account.
    
    Validates that the requested username is not already in use, and
    requires the password to be entered twice to catch typos.
    """
    username = forms.CharField(max_length=15, label=_(u'Username'))
    email = forms.EmailField(label=_(u'Email address'))
    password1 = forms.CharField(widget=forms.PasswordInput(render_value=False), label=_(u'Password'))
    password2 = forms.CharField(widget=forms.PasswordInput(render_value=False), label=_(u'Password (again)'))

    def clean(self):
        # Same password
        if 'password1' in self.cleaned_data and 'password2' in self.cleaned_data:
            if self.cleaned_data['password1'] != self.cleaned_data['password2']:
                raise forms.ValidationError(_(u'You must type the same password each time'))

        # Unique username
        if User.objects.filter(username=self.cleaned_data.get('username')).count() > 0:
            raise ValidationError(_('There is already a user with the same username.'))

        # Unique email
        if User.objects.filter(email=self.cleaned_data.get('email')).count() > 0:
            raise ValidationError(_('There is already a user with the same email address.'))

        return self.cleaned_data
    
    def save(self, profile_callback=None):
        """
        Creates and return the User. Although we don't require validation,
        this would be the place to add it.
        """
        new_user = User.objects.create_user(
            username=self.cleaned_data['username'],
            password=self.cleaned_data['password1'],
            email=self.cleaned_data['email']
            )
        new_user.save()
        return new_user
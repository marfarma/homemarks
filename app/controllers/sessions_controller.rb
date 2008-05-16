class SessionsController < ApplicationController
  
  helper SiteHelper
  filter_parameter_logging :password
  
  skip_before_filter :login_required, :except => [ :destroy ]
  
  
  def new
    render
  end
  
  def create
    self.current_user = User.authenticate(params[:email], params[:password])
    return head :ok if logged_in?
    render :json => login_failures, :status => :unauthorized, :content_type => 'application/json'
  end
  
  def jumpin
    destination = logged_in? ? myhome_url : root_url
    redirect_to destination
  end
  
  def forgot_password
    unless @user = User.find_by_email(params[:user][:email])
      render(:update) { |page| page.complete_forgotpw_form('bad') }
    else
      @user.generate_security_token && @user.save!
      UserNotify.deliver_forgot_password(@user)
      render(:update) { |page| page.complete_forgotpw_form('good') }
    end
  end
  
  
  # def jumpin
  #   redirect_to eval(params[:redirect]+'_url')
  # end
  
  # def destroy
  #   reset_session
  #   flash[:notice] = "You have been logged out."
  #   redirect_back_or_default
  # end

  
  protected
  
  def login_failures
    login_failed_message = "Login failed. Please double check what you entered. If you still have problems, use the forgot password button."
    returning messages = [] do
      messages << "Email is blank" if params[:email].blank?
      messages << "Password is blank" if params[:password].blank?
      messages << login_failed_message if messages.blank?
    end
  end
  
  
end
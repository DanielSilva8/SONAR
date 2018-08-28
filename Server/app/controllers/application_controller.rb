class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception
  before_action :authenticate_user!, :except => [:index, :home, :help, :contact, :xdkapi, :connect, :disconnect, :register]
  before_action :notifications
  
  protected

  def notifications

    begin


    @notifications = []
    

    aux = Notification.where(user_id: current_user.id) 
    if aux != nil   
    
    aux.each do |i|
      aux2 = Reading.find_by(_id: i.reading_id)
      aux3 = XdkClient.find_by(_id: i.xdk_client_id)
      @notifications << NotificationADAPTER.new(aux3.name, i.xdk_client_id, aux2.value, aux2.date, i.message)
    end

    end
    rescue
      @notifications = []
    end

  end
end




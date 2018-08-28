class SensorApiController < ApplicationController
  protect_from_forgery with: :exception, if: Proc.new { |c| c.request.format != 'application/json' }
  protect_from_forgery with: :null_session, if: Proc.new { |c| c.request.format == 'application/json' }
 

  def register
  	
     if(params[:id] != nil)

        if XdkClient.find_by(ref: params[:id]) == nil

        g = Group.find_by(lat: params[:lat], lon:params[:lon])  
       
        if g == nil
          g = Group.find_by(name: 'default')
          if g == nil
             Group.create( 
                 lat: nil,
                 lon: nil,
                 name: 'default'
             )
             g = Group.find_by(name: 'default')          
        end
        end
        XdkClient.create( 
           ref: params[:id],
           lat: params[:lat],
           lon: params[:lon],
           name: params[:name],
           state: 0,
           group_id: g._id
        )
      end

     end

  	 respond_to do |format|
        format.html {redirect_to root_path}
        format.js
        format.json
     end
  end

  def xdkapi
    
    if(params[:id] != nil)

        x = XdkClient.find_by(ref: params[:id])
        if x != nil and x.state == 1
          
          if params[:aco] != -1
            p = params[:aco]
            p =  '%.2f' % p
            Reading.create( 
              date: params[:time],
              value: p,
              type: 1,
              xdk_client_id: x._id
            )
            r = Reading.last
            
            Thread.new{
            verifyNotifications(x._id, p, r._id)
            }
          end
        end
    end
    
    respond_to do |format|
        format.html {redirect_to root_path}
        format.js
        format.json
     end
  end

  def verifyNotifications(xdk_id, value, reading_id)

    x = UserValue.all
    
    if x != nil
    x.each do |i|
      if  i.max < value.to_f
          
          Notification.create( 
              message: 'Value very high. check it out',
              user_id: i.user_id,
              reading_id: reading_id,
              xdk_client_id: xdk_id
       )
      elsif i.min > value.to_f
          
          Notification.create( 
              message: 'Value very low. check it out',
              user_id: i.user_id,
              reading_id: reading_id,
              xdk_client_id: xdk_id
       )   
      end
    end
  end

  end
  
  def connect

    if(params[:id] != nil)

        x = XdkClient.find_by(ref: params[:id])
        if x != nil
          x.update_attributes!(
             state: 1
        )
        end
      end

  	respond_to do |format|
        format.html {redirect_to root_path}
        format.js
        format.json
    end
  end

  def disconnect

    if(params[:id] != nil)

        x = XdkClient.find_by(ref: params[:id])
        if x != nil
          x.update_attributes!(
             state: 0
        )
        end
      end

  	respond_to do |format|
        format.html {redirect_to root_path}
        format.js
        format.json
    end
  end

end

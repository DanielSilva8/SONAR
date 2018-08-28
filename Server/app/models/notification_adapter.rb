class NotificationADAPTER
   def initialize(name, xdk, max, date, message)
     @name = name
     @XDK = xdk
     @max = max
     @date = date
     @message = message
   end
   def getMax
  @max
   end

def getName
  @name
 end

 def getXdk
  @XDK
 end

 def getDate
  @date
 end

 def getMessage
  @message 
   end
end
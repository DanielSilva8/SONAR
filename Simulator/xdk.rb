require 'httparty'

class XDK
  attr_reader :name, :url, :nfTemp, :nfAco, :lat, :lon
  def initialize(name, url, nfTemp, nfAco, lat, lon)
    
    @name = name
    @id = rand(6**8).to_s(36).chomp
    @lat = lat
    @lon = lon
    @observers=[url]
    @nfTemp=nfTemp
    @nfAco=nfAco
    @timerA = 0
    @timerT = 0
    @state = true
    @notify = []
    puts 'XDK Created with ID: ' + @id
  end

  def start
    @state = true
    registerobserver('ola')
    if connect
      puts 'host connected'   
      run
    else
      puts 'No active connections'
    end
  end

  def stop
    @state = false
    disconnect
  end

  def registerobserver(url)
    begin
      #@observers += [url]
      begin
        @result = HTTParty.post("http://localhost:3000/register", :body => {:name => @name, :id => @id, :lat => @lat, :lon => @lon }.to_json,
    :headers => { 'ACCEPT' => "application/json", 'CONTENT_TYPE' => 'application/json'})
         puts "Host Registered "
        rescue
           puts "Can't register on http://localhost:3000/register"
           puts @result.code 
        end
    rescue
      puts "Connection failed on Host: "
    end
  end

  def removeobserver(url)
    begin
      @observers -= [url]
      puts "Host Removed"
    rescue
      puts "Failure removeobserver"
    end
  end

  def notifyobservers(temperature , acoustic, time, latitude, longitude)
    array = [@id, temperature, acoustic, time, latitude, longitude]
    aux = array
    i=0
    @observers.each { |x| send( aux, x) ; i += 1}
    if i == 0
      puts 'No active connections'
      puts 'Stoping Sending Data'
      @state = false
    end
  end

  def disconnect
    puts 'Closing active connections'
        begin
        @result = HTTParty.post("http://localhost:3000/disconnect", :body => {:id => @id }.to_json,
    :headers => { 'ACCEPT' => "application/json", 'CONTENT_TYPE' => 'application/json'})
     puts 'Closed'
        rescue
           puts "Can't disconnect on http://localhost:3000/disconnect"
           puts @result.code 
        end
    @state = false
    puts 'closed'
  end

  def connect
    begin
    puts 'Connecting to Server'
    i=0
    @observers.each { |x|
        begin
        @result = HTTParty.post("http://localhost:3000/connect", :body => {:id => @id }.to_json,
    :headers => { 'ACCEPT' => "application/json", 'CONTENT_TYPE' => 'application/json'})
        rescue
           puts "Can't connect on http://localhost:3000/connect"
           puts @result.code 
        end
        i+=1
    }
    rescue
    puts "Can't connect"
    end
    return true if i > 0
    return false
  end

  def send(data, observer)
    puts 'Sending Data'
    begin
    @result = HTTParty.post("http://localhost:3000/xdkapi", :body => {:id => data[0], :temp => data[1], :aco => data[2], :time => data[3] }.to_json,
    :headers => { 'ACCEPT' => "application/json", 'CONTENT_TYPE' => 'application/json'})
    puts @result.code
    rescue
      puts "Connection failed on Host: " + observer
      puts "Deleting Connection"
      @observers -= observer
    end
  end

  def run
    puts 'Sending data'
    Thread.new{
      @tinitial = Time.now
      @timerA = 0
      @timerT = 0
      while @state do
        sleep(0.5)
        (temp,@timerT) = notify?(@tinitial,@timerT, 1) if !@notify[0]
        (aco,@timerA) = notify?(@tinitial,@timerA, 2) if !@notify[1]
        if @notify.include?(true)
          notifyobservers(temp ,aco ,Time.now.ctime, getGPS[0], getGPS[1])
          @notify = [false, false]
        end
      end
    }
  end

  def notify?(tinitial, a, type)
    if (Time.now - tinitial) >= a
      case type
        when 1
          a += @nfTemp
          @notify[0] = true
          return [getTemperature,a ]
        when 2
          @notify[1] = true
          a += @nfAco
          return [getAcoustic, a ]
      end
    else
      return [-1, a]
    end
  end

  def getTemperature
    return rand(20.0...24.9)
  end

  def getAcoustic
    return rand(80.0...99.9)
  end

  def getGPS
    return [@lat, @lon]
  end
  def changenotifyfrequency(param1, param2)
    if param2.is_a? Integer
      @nfTemp = param1
      @nfAco = param2

    elsif param2 == 'temperatura'
      @nfTemp = param1
    elsif param2 == 'acustico'
      @nfAco = param1
    end
    @tinitial = Time.now
    @timerA = 0
    @timerT = 0
    notifyobservers(getTemperature ,getAcoustic ,Time.now.ctime, getGPS[0], getGPS[1])
  end
end



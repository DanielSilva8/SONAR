Rails.application.routes.draw do
  get 'xdkapi', to: 'sensor_api#xdkapi'
  post 'xdkapi', to: 'sensor_api#xdkapi'

  get 'connect', to: 'sensor_api#connect'
  post 'connect', to: 'sensor_api#connect'

  get 'disconnect', to: 'sensor_api#disconnect'
  post 'disconnect', to: 'sensor_api#disconnect'

  get 'register', to: 'sensor_api#register'
  post 'register', to: 'sensor_api#register'

  get 'sensor/list' 
  get 'sensor/listsearch' 
  get 'sensor/listgroup'

  get 'sensor/details/:id', to: 'sensor#details', as: 'sensor'

  get 'sensor/realtime'

  get 'sensor/realtime/:id', to: 'sensor#realtime', as: 'realtime'

  get 'map', to: 'map#index'

  devise_for :users

  get 'home/help'
  get 'home/contact'
  get 'home', to: 'home#index'
  get 'help' , to: 'home#help'
  get 'contact', to: 'home#contact'
  get 'group/:id', to: 'sensor#group', as: 'group'
  get 'notfound', to: 'home#notfound'
  get 'profile', to: 'home#profile'
  post 'profile', to: 'home#addLocation'
  post 'addgroup', to: 'sensor#addgroup'
  post 'profile2', to: 'home#addMinMax'
  get 'deleteNotifications', to: 'home#deleteNotifications'
  root  'home#index'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end

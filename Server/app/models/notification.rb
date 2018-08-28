class Notification
  include Mongoid::Document
  field :message, type: String
  belongs_to :user
  belongs_to :reading
  belongs_to :xdk_client
end

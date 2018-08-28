class Reading
  include Mongoid::Document
  include Mongoid::Attributes::Dynamic

  field :date, type: Time, default: Time.now
  field :value, type: Float
  field :type, type: Integer
  has_many :notifications
  belongs_to :xdk_client
end

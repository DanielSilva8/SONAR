require 'test_helper'

class SensorApiControllerTest < ActionDispatch::IntegrationTest
  test "should get xdkapi" do
    get sensor_api_xdkapi_url
    assert_response :success
  end

end

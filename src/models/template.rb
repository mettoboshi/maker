# Copyright 2014 TIS inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
require 'json'
require 'adapter'
require 'nokogiri'

class Template < ActiveRecord::Base
  CLOUD_CONDUCTOR_SCHEMA = 'config/cloudconductor.xsd'
  CLOUD_CONDUCTOR_META_SCHEMA = 'config/cloudconductor_meta.xsd'

  attr_accessor :commit_message, :xml, :meta_xml, :access_token, :organization

  before_save :commit

  def adapter_instance
    return @adapter_instance if @adapter_instance

    require "adapters/#{adapter}"

    klass_name = adapter.to_s.split('_').map(&:capitalize) * ''
    klass = Adapters.const_get(klass_name)
    @adapter_instance = klass.new access_token: access_token
  end

  def fetch_xml
    @xml = adapter_instance.fetch "#{owner}/#{repository}", path, revision
  end

  def fetch_meta_xml
    @meta_xml = adapter_instance.fetch "#{owner}/#{repository}", path.sub(/\.xml$/, '_meta.xml'), revision
  end

  def as_json(options)
    options[:methods] = options[:methods] || []
    options[:methods] << :xml
    options[:methods] << :meta_xml
    super.as_json  options
  end

  def valid?
    xsd_validate 'xml', CLOUD_CONDUCTOR_SCHEMA, @xml
    xsd_validate 'meta_xml', CLOUD_CONDUCTOR_META_SCHEMA, @meta_xml

    errors.empty?
  end

  private

  def xsd_validate(key, xsd_path, xml)
    xsd = Nokogiri::XML::Schema(File.read(xsd_path))
    doc = Nokogiri::XML(xml)

    xsd.validate(doc).each do |error|
      errors.add(key, error.message)
    end
  end

  def commit
    options = {
      access_token: @access_token,
      repository: "#{owner}/#{repository}",
      revision: revision,
      path: path,
      commit_message: commit_message,
      xml: xml,
      meta_xml: meta_xml,
      organization: organization
    }
    adapter_instance.commit options
  end
end

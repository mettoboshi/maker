require File.expand_path('../src/models/template', File.dirname(__FILE__))

def reset_autoincrement(table_name)
  case ActiveRecord::Base.connection.adapter_name
  when 'SQLite'
    update_seq_sql = "update sqlite_sequence set seq = 0 where name = '#{table_name}';"
    ActiveRecord::Base.connection.execute(update_seq_sql)
  when 'PostgreSQL'
    ActiveRecord::Base.connection.reset_pk_sequence!(table_name)
  else
    fail 'Task not implemented for this DB adapter'
  end
end

# rubocop:disable LineLength
Template.destroy_all
reset_autoincrement 'templates'

# ---- 1-segment 3-layer model
template = Template.new
template.name = '1-segment 3-layer model'
template.description = 'WEB/AP/DB 3-layer model'
template.remarks = 'Remarks'

template.adapter = 'github'
template.owner = 'cloudconductor'
template.repository = 'xml-store'
template.revision = 'master'
template.path = '1seg-3layer/1seg-3layer.xml'
template.send(:create_without_callbacks)

# ---- 2-segment 3-layer model
template = Template.new
template.name = '2-segment 3-layer model'
template.description = 'WEB/AP/DB 3-layer model + DMZ + Router'
template.remarks = 'Remarks'

template.adapter = 'github'
template.owner = 'cloudconductor'
template.repository = 'xml-store'
template.revision = 'master'
template.path = '2seg-3layer/2seg-3layer.xml'
template.send(:create_without_callbacks)
# rubocop:enable LineLength

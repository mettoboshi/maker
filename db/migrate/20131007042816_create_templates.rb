class CreateTemplates < ActiveRecord::Migration
  def self.up
    create_table :templates do |t|
      t.string :name
      t.string :description
      t.string :remarks

      t.string :adapter
      t.string :owner
      t.string :repository
      t.string :revision
      t.string :path
      t.timestamps
    end
  end

  def self.down
    drop_table :templates
  end
end

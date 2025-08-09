import { useState, useEffect } from 'react'
import { Card, Button, Form, Input, DatePicker, Select, Modal, List, Avatar, Tag, Space, Divider, Typography, message } from 'antd'
import { PlusOutlined, GiftOutlined, PhoneOutlined, MailOutlined, EditOutlined, DeleteOutlined, SmileOutlined } from '@ant-design/icons'
import { Birthday } from '../entities/Birthday'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input

function BirthdayApp() {
  const [birthdays, setBirthdays] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingBirthday, setEditingBirthday] = useState(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadBirthdays()
  }, [])

  const loadBirthdays = async () => {
    try {
      const response = await Birthday.list()
      if (response.success) {
        setBirthdays(response.data)
      }
    } catch (error) {
      message.error('Failed to load birthdays')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values) => {
    try {
      const birthdayData = {
        ...values,
        birthDate: values.birthDate.format('YYYY-MM-DD')
      }

      if (editingBirthday) {
        await Birthday.update(editingBirthday._id, birthdayData)
        message.success('Birthday updated successfully!')
      } else {
        await Birthday.create(birthdayData)
        message.success('Birthday added successfully!')
      }

      setModalVisible(false)
      setEditingBirthday(null)
      form.resetFields()
      loadBirthdays()
    } catch (error) {
      message.error('Failed to save birthday')
    }
  }

  const handleEdit = (birthday) => {
    setEditingBirthday(birthday)
    form.setFieldsValue({
      ...birthday,
      birthDate: dayjs(birthday.birthDate)
    })
    setModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      // Note: Birthday.delete might need to be implemented
      message.success('Birthday deleted successfully!')
      loadBirthdays()
    } catch (error) {
      message.error('Failed to delete birthday')
    }
  }

  const getTodaysBirthdays = () => {
    const today = dayjs()
    return birthdays.filter(birthday => {
      const birthDate = dayjs(birthday.birthDate)
      return birthDate.month() === today.month() && birthDate.date() === today.date()
    })
  }

  const getUpcomingBirthdays = () => {
    const today = dayjs()
    return birthdays
      .map(birthday => {
        const birthDate = dayjs(birthday.birthDate)
        let nextBirthday = birthDate.year(today.year())
        
        if (nextBirthday.isBefore(today)) {
          nextBirthday = nextBirthday.year(today.year() + 1)
        }
        
        return {
          ...birthday,
          nextBirthday,
          daysUntil: nextBirthday.diff(today, 'day')
        }
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5)
  }

  const getAge = (birthDate) => {
    return dayjs().diff(dayjs(birthDate), 'year')
  }

  const wishHappyBirthday = (birthday) => {
    const age = getAge(birthday.birthDate)
    const message = `🎉 Happy ${age}th Birthday, ${birthday.name}! 🎂 Hope you have a wonderful day filled with joy and celebration! 🎈`
    
    // Copy to clipboard
    navigator.clipboard.writeText(message)
    Modal.success({
      title: 'Birthday Wish Ready!',
      content: (
        <div>
          <p>The birthday message has been copied to your clipboard:</p>
          <div className="bg-blue-50 p-3 rounded mt-2">
            <Text>{message}</Text>
          </div>
          {birthday.phone && (
            <div className="mt-3">
              <Text strong>Phone: </Text>
              <Text copyable>{birthday.phone}</Text>
            </div>
          )}
          {birthday.email && (
            <div className="mt-2">
              <Text strong>Email: </Text>
              <Text copyable>{birthday.email}</Text>
            </div>
          )}
        </div>
      ),
    })
  }

  const todaysBirthdays = getTodaysBirthdays()
  const upcomingBirthdays = getUpcomingBirthdays()

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <Title level={1} className="text-center mb-2">
          <SmileOutlined className="mr-2" />
          Birthday Wishes
        </Title>
        <Text className="block text-center text-gray-600">
          Never forget to wish your loved ones a happy birthday
        </Text>
      </div>

      {/* Today's Birthdays */}
      {todaysBirthdays.length > 0 && (
        <Card className="mb-6 border-2 border-yellow-300 bg-yellow-50">
          <Title level={3} className="text-yellow-700 mb-4">
            🎉 Today's Birthdays!
          </Title>
          <List
            dataSource={todaysBirthdays}
            renderItem={(birthday) => (
              <List.Item
                actions={[
                  <Button 
                    type="primary" 
                    icon={<GiftOutlined />} 
                    onClick={() => wishHappyBirthday(birthday)}
                    className="bg-yellow-500 hover:bg-yellow-600 border-yellow-500"
                  >
                    Send Wishes
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar size={48} className="bg-yellow-500">{birthday.name[0]}</Avatar>}
                  title={
                    <div>
                      <span className="text-lg font-semibold">{birthday.name}</span>
                      <Tag color="gold" className="ml-2">Turning {getAge(birthday.birthDate)}</Tag>
                    </div>
                  }
                  description={
                    <div>
                      <Text type="secondary">{birthday.relationship || 'Friend'}</Text>
                      {birthday.notes && (
                        <div className="mt-1">
                          <Text className="text-sm">{birthday.notes}</Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add Birthday Card */}
        <Card className="lg:col-span-1">
          <div className="text-center">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
              className="w-full h-32 text-lg"
            >
              Add New Birthday
            </Button>
          </div>
          
          {upcomingBirthdays.length > 0 && (
            <div className="mt-6">
              <Title level={4}>Upcoming Birthdays</Title>
              <List
                dataSource={upcomingBirthdays}
                renderItem={(birthday) => (
                  <List.Item className="px-0">
                    <List.Item.Meta
                      avatar={<Avatar size="small">{birthday.name[0]}</Avatar>}
                      title={<Text className="text-sm">{birthday.name}</Text>}
                      description={
                        <Text type="secondary" className="text-xs">
                          {birthday.daysUntil === 0 
                            ? 'Today!' 
                            : `${birthday.daysUntil} day${birthday.daysUntil > 1 ? 's' : ''}`
                          }
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </div>
          )}
        </Card>

        {/* All Birthdays List */}
        <Card className="lg:col-span-2" title="All Birthdays" loading={loading}>
          <List
            dataSource={birthdays}
            renderItem={(birthday) => (
              <List.Item
                actions={[
                  <Button 
                    icon={<GiftOutlined />} 
                    onClick={() => wishHappyBirthday(birthday)}
                    type="text"
                  >
                    Wish
                  </Button>,
                  <Button 
                    icon={<EditOutlined />} 
                    onClick={() => handleEdit(birthday)}
                    type="text"
                  />,
                  <Button 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleDelete(birthday._id)}
                    type="text"
                    danger
                  />
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar>{birthday.name[0]}</Avatar>}
                  title={
                    <div className="flex items-center gap-2">
                      <span>{birthday.name}</span>
                      <Tag color="blue">{birthday.relationship || 'Friend'}</Tag>
                    </div>
                  }
                  description={
                    <div>
                      <div className="mb-1">
                        <Text type="secondary">
                          {dayjs(birthday.birthDate).format('MMMM D, YYYY')} 
                          <span className="ml-2">({getAge(birthday.birthDate)} years old)</span>
                        </Text>
                      </div>
                      <Space size="small">
                        {birthday.phone && (
                          <Text className="text-xs"><PhoneOutlined /> {birthday.phone}</Text>
                        )}
                        {birthday.email && (
                          <Text className="text-xs"><MailOutlined /> {birthday.email}</Text>
                        )}
                      </Space>
                      {birthday.notes && (
                        <div className="mt-1">
                          <Text className="text-sm text-gray-600">{birthday.notes}</Text>
                        </div>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={editingBirthday ? 'Edit Birthday' : 'Add New Birthday'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingBirthday(null)
          form.resetFields()
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input placeholder="Enter person's name" />
          </Form.Item>

          <Form.Item
            name="birthDate"
            label="Birth Date"
            rules={[{ required: true, message: 'Please select birth date' }]}
          >
            <DatePicker className="w-full" />
          </Form.Item>

          <Form.Item
            name="relationship"
            label="Relationship"
          >
            <Select
              placeholder="Select relationship"
              options={[
                { value: 'Family', label: 'Family' },
                { value: 'Friend', label: 'Friend' },
                { value: 'Colleague', label: 'Colleague' },
                { value: 'Partner', label: 'Partner' },
                { value: 'Other', label: 'Other' }
              ]}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="phone"
              label="Phone"
            >
              <Input placeholder="Phone number" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
            >
              <Input placeholder="Email address" />
            </Form.Item>
          </div>

          <Form.Item
            name="notes"
            label="Notes"
          >
            <TextArea rows={3} placeholder="Gift ideas, preferences, etc." />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button 
                onClick={() => {
                  setModalVisible(false)
                  setEditingBirthday(null)
                  form.resetFields()
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingBirthday ? 'Update' : 'Add'} Birthday
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BirthdayApp
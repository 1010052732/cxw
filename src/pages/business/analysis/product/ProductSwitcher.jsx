import { useState } from 'react'
import { Button, Space, Tag, Typography } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import ProductSearchModal from './ProductSearchModal'

const { Text } = Typography

/** 价格/供需/壁垒页共用的「更换商品」入口，统一走列表弹窗 */
export default function ProductSwitcher({ productName, skuLabel, onProductChange }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Space wrap>
        <Text>当前商品</Text>
        <Tag color="processing">{skuLabel || productName}</Tag>
        {skuLabel && skuLabel !== productName && <Tag>档案：{productName}</Tag>}
        <Button size="small" icon={<SwapOutlined />} onClick={() => setOpen(true)}>更换商品</Button>
      </Space>
      <ProductSearchModal
        open={open}
        onClose={() => setOpen(false)}
        initialKeyword={skuLabel || productName}
        activeName={productName}
        onSelect={(row) => {
          onProductChange?.({
            catalogName: row.parent || row.name,
            skuLabel: row.name,
            hs: row.hsCode,
          })
        }}
      />
    </>
  )
}

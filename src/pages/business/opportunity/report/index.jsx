import { useEffect, useMemo } from 'react'
import ExportButton from '../../../../components/ExportButton'
import { loadReportConfig, saveReportConfig } from '../../../../utils/reportStorage'
import {
  App,
  Button,
  Descriptions,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import { Column, Radar } from '@ant-design/charts'
import {
  DownloadOutlined,
  EditOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PrinterOutlined,
  RollbackOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  REPORT_SECTION_OPTIONS,
  buildComboReport,
  buildEvaluationReport,
} from '../../../../mock/opportunity'
import { exportReportToExcel } from './export'
import '../opportunity.css'

const { Paragraph, Title, Text } = Typography

const DEFAULT_SECTIONS = REPORT_SECTION_OPTIONS.filter((s) => s.default).map((s) => s.key)

function Section({ show, title, children }) {
  if (!show) return null
  return (
    <section className="report-section">
      <h2 className="report-section-title">{title}</h2>
      {children}
    </section>
  )
}

function SingleReportBody({ report, sections, radarData, barData, riskColumns }) {
  return (
    <>
      <Section show={sections.includes('background')} title="一、商机基本背景">
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="商机ID">{report.background?.oppId || report.id}</Descriptions.Item>
          <Descriptions.Item label="商机来源">{report.background?.geoLabel || '—'}</Descriptions.Item>
          <Descriptions.Item label="目标市场">{report.background?.country || report.country}</Descriptions.Item>
          <Descriptions.Item label="关联产品">{report.background?.product || report.product}</Descriptions.Item>
          <Descriptions.Item label="市场规模">{report.background?.marketSize}</Descriptions.Item>
          <Descriptions.Item label="收益区间">{report.background?.revenueRange}</Descriptions.Item>
          <Descriptions.Item label="驱动因素">{report.background?.driver}</Descriptions.Item>
          <Descriptions.Item label="时间属性">{report.background?.horizon}</Descriptions.Item>
          <Descriptions.Item label="发现日期">{report.background?.discoveredAt}</Descriptions.Item>
        </Descriptions>
      </Section>

      <Section show={sections.includes('indicators')} title="二、评估指标体系概况">
        <Table
          size="small"
          pagination={false}
          rowKey="name"
          dataSource={report.indicatorOverview || []}
          columns={[
            { title: '模型', dataIndex: 'name', key: 'name' },
            { title: '对应维度', dataIndex: 'dimension', key: 'dimension', render: (v) => ({ market: '市场需求', policy: '政策环境', credit: '交易信用' }[v] || v) },
            { title: '指标分组', dataIndex: 'groups', key: 'groups' },
          ]}
        />
      </Section>

      <Section show={sections.includes('scores')} title="三、指标得分与权重配置">
        <Paragraph><Text strong>权重公式：</Text>{report.weightFormula}</Paragraph>
        <Table
          size="small"
          pagination={false}
          rowKey="dimension"
          dataSource={report.scoreBreakdown || []}
          columns={[
            { title: '评估维度', dataIndex: 'dimension', key: 'dimension' },
            { title: '原始得分', dataIndex: 'score', key: 'score' },
            { title: '权重', dataIndex: 'weight', key: 'weight', render: (v) => `${v}%` },
            { title: '加权得分', dataIndex: 'weighted', key: 'weighted' },
          ]}
        />
        <div className="report-conclusion-grid" style={{ marginTop: 16 }}>
          <div>
            <div className="report-score-big">{report.compositeScore}</div>
            <Space>
              <Tag color="#B32620">评级 {report.rating}</Tag>
              {report.rank && <Tag>排名第 {report.rank}</Tag>}
              <Tag color="success">风险 {report.riskLevel}</Tag>
            </Space>
          </div>
          <div>
            <Paragraph><Text strong>核心机遇：</Text>{report.opportunities?.join('；')}</Paragraph>
            <Paragraph><Text strong>核心风险：</Text>{report.risks?.join('；')}</Paragraph>
          </div>
        </div>
      </Section>

      <Section show={sections.includes('interpretation')} title="四、评估结论解读">
        <Paragraph style={{ fontSize: 15, lineHeight: 1.9 }}>{report.interpretation}</Paragraph>
        <Paragraph><Text strong>跟进建议：</Text>{report.suggestions?.join('；')}</Paragraph>
      </Section>

      <Section show={sections.includes('policy')} title="五、政策环境与制度条件解读">
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="关税安排">{report.policyAnalysis?.tariff}</Descriptions.Item>
          <Descriptions.Item label="自贸协定">{report.policyAnalysis?.fta}</Descriptions.Item>
          <Descriptions.Item label="行业准入">{report.policyAnalysis?.access}</Descriptions.Item>
        </Descriptions>
        <Paragraph style={{ marginTop: 12 }}><Text strong>政策红利：</Text>{report.policyAnalysis?.bonus?.join(' · ')}</Paragraph>
        <Paragraph><Text strong>潜在政策风险：</Text>{report.policyAnalysis?.risks?.join('；')}</Paragraph>
      </Section>

      <Section show={sections.includes('credit')} title="六、信用评估与交易安全">
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="交易对手">{report.creditAnalysis?.buyerName}</Descriptions.Item>
          <Descriptions.Item label="信用评级">{report.creditAnalysis?.buyerRating}</Descriptions.Item>
          <Descriptions.Item label="信用评分">{report.creditAnalysis?.buyerScore}</Descriptions.Item>
          <Descriptions.Item label="采购规模">{report.creditAnalysis?.purchaseScale}</Descriptions.Item>
          <Descriptions.Item label="支付行为" span={2}>{report.creditAnalysis?.payment}</Descriptions.Item>
          <Descriptions.Item label="合作历史" span={2}>{report.creditAnalysis?.history}</Descriptions.Item>
          <Descriptions.Item label="国别风险" span={2}>{report.creditAnalysis?.countryRisk}</Descriptions.Item>
        </Descriptions>
      </Section>

      <Section show={sections.includes('entry')} title="七、合作模式与进入路径建议">
        <Table
          size="small"
          pagination={false}
          rowKey="mode"
          dataSource={report.entryPaths || []}
          columns={[
            { title: '进入路径', dataIndex: 'mode', key: 'mode' },
            { title: '适配度', dataIndex: 'fit', key: 'fit', render: (v) => <Tag color={v === '高' ? 'success' : v === '中' ? 'processing' : 'default'}>{v}</Tag> },
            { title: '说明', dataIndex: 'desc', key: 'desc' },
          ]}
        />
        <Paragraph style={{ marginTop: 12 }}>
          <Text strong>推荐合作模式：</Text>
          {(report.cooperationModes || []).join('、')}
        </Paragraph>
      </Section>

      <Section show={sections.includes('comparison')} title="八、多维度对比分析">
        <div className="report-compare-grid">
          <div className="report-chart-box">
            <Radar data={radarData} xField="item" yField="score" seriesField="type" height={320} meta={{ score: { min: 0, max: 100 } }} legend={{ position: 'bottom' }} />
          </div>
          <div>
            <Title level={5}>优势分析</Title>
            <ul>{report.strengths?.map((item) => <li key={item}>{item}</li>)}</ul>
            <Title level={5}>劣势分析</Title>
            <ul>{report.weaknesses?.map((item) => <li key={item}>{item}</li>)}</ul>
          </div>
        </div>
        <div className="report-chart-box" style={{ marginTop: 16 }}>
          <Column data={barData} xField="dimension" yField="score" height={280} color="#B32620" label={{ position: 'top' }} meta={{ score: { min: 0, max: 100 } }} />
        </div>
      </Section>

      <Section show={sections.includes('risk')} title="九、竞争格局与风险评估">
        <div className="report-risk-grid">
          <div>
            <Title level={5}>竞争格局</Title>
            <Table size="small" pagination={false} rowKey="name" columns={[
              { title: '竞争者', dataIndex: 'name', key: 'name' },
              { title: '份额', dataIndex: 'share', key: 'share', width: 80 },
              { title: '优势', dataIndex: 'advantage', key: 'advantage' },
            ]} dataSource={report.competitors || []} />
          </div>
          <div>
            <Title level={5}>风险分析</Title>
            <Table size="small" pagination={false} rowKey="type" columns={riskColumns} dataSource={report.riskItems || []} />
          </div>
        </div>
      </Section>

      <Section show={sections.includes('actions')} title="十、行动计划">
        <div className="report-action-list">
          <h4>高优先级</h4>
          <ul>{report.actionPlans?.high?.map((item) => <li key={item}>{item}</li>)}</ul>
          <h4>中优先级</h4>
          <ul>{report.actionPlans?.medium?.map((item) => <li key={item}>{item}</li>)}</ul>
          <h4>低优先级</h4>
          <ul>{report.actionPlans?.low?.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </Section>
    </>
  )
}

export default function OpportunityReportPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { message } = App.useApp()

  const stored = loadReportConfig(id)
  const ids = location.state?.ids || stored?.ids || [id]
  const weights = location.state?.weights || stored?.weights
  const scheme = location.state?.scheme || stored?.scheme || '商机评估方案 V1'
  const sections = location.state?.sections || stored?.sections || DEFAULT_SECTIONS
  const isCombo = location.state?.combo ?? stored?.combo ?? ids.length > 1

  useEffect(() => {
    if (location.state?.ids || location.state?.weights) {
      saveReportConfig(id, { ids, weights, scheme, sections, combo: isCombo })
    }
  }, [id, ids, weights, scheme, sections, isCombo, location.state])

  const comboReport = useMemo(
    () => (isCombo ? buildComboReport(ids, { weights, scheme }) : null),
    [isCombo, ids, weights, scheme],
  )

  const report = useMemo(
    () => buildEvaluationReport(id, { weights, scheme, rank: comboReport?.items?.find((i) => i.id === id)?.rank }),
    [id, weights, scheme, comboReport],
  )

  const generatedAt = comboReport?.generatedAt || new Date().toLocaleString('zh-CN', { hour12: false })
  const reportNo = comboReport?.reportNo || `RPT-${id}`

  const radarData = [
    { item: '市场需求潜力', type: '当前商机', score: report.marketScore },
    { item: '政策环境友好度', type: '当前商机', score: report.policyScore },
    { item: '交易信用安全度', type: '当前商机', score: report.creditScore },
    { item: '市场需求潜力', type: '行业平均', score: report.industryAvg?.market },
    { item: '政策环境友好度', type: '行业平均', score: report.industryAvg?.policy },
    { item: '交易信用安全度', type: '行业平均', score: report.industryAvg?.credit },
    { item: '市场需求潜力', type: '行业标杆', score: report.benchmark?.market },
    { item: '政策环境友好度', type: '行业标杆', score: report.benchmark?.policy },
    { item: '交易信用安全度', type: '行业标杆', score: report.benchmark?.credit },
  ]

  const barData = (report.scoreBreakdown || []).map((r) => ({ dimension: r.dimension.replace('潜力', '').replace('友好度', '').replace('安全度', ''), score: r.score }))

  const riskColumns = [
    { title: '风险类型', dataIndex: 'type', key: 'type', width: 120 },
    { title: '等级', dataIndex: 'level', key: 'level', width: 80, render: (level) => <Tag color={level === '低' ? 'success' : level === '中' ? 'warning' : 'error'}>{level}</Tag> },
    { title: '说明', dataIndex: 'desc', key: 'desc' },
  ]

  const handleExportPdf = () => {
    message.info('正在准备 PDF 导出…')
    window.print()
  }

  const handleExportExcel = () => {
    if (isCombo && comboReport) {
      exportReportToExcel({ ...comboReport, generatedAt }, true)
    } else {
      exportReportToExcel({ ...report, generatedAt }, false)
    }
    message.success('Excel(CSV) 文件已下载')
  }

  return (
    <div className="report-page-wrapper">
      <div className="report-toolbar no-print" style={{ width: '1000px', maxWidth: '100%' }}>
        <Space wrap>
          <Button icon={<RollbackOutlined />} onClick={() => navigate('/opportunity/evaluation')}>返回评估与排序</Button>
          <Button icon={<EditOutlined />} onClick={() => navigate('/opportunity/report/generate')}>重新配置</Button>
          <ExportButton type="primary" icon={<FilePdfOutlined />} onExport={handleExportPdf}>导出 PDF</ExportButton>
          <ExportButton icon={<FileExcelOutlined />} onExport={handleExportExcel}>导出 Excel</ExportButton>
          <Button icon={<PrinterOutlined />} onClick={() => window.print()}>打印</Button>
          <Button icon={<DownloadOutlined />} onClick={() => message.success('报告归档任务已创建')}>归档留痕</Button>
        </Space>
      </div>

      <div className="report-document">
        <section className="report-cover">
          <Title level={1}>{isCombo ? '跨境商贸商机组合评估报告' : '跨境商贸商机评估报告'}</Title>
          <div className="report-cover-meta">
            <div>报告编号：{reportNo}</div>
            <div>生成时间：{generatedAt}</div>
            <div>评估方案：{scheme}</div>
            <div>评估对象：{isCombo ? `${comboReport.count} 个商机组合` : report.title}</div>
            {!isCombo && <div>权重配置：市场 {report.weights?.market}% · 政策 {report.weights?.policy}% · 信用 {report.weights?.credit}%</div>}
          </div>
        </section>

        {isCombo && comboReport && (
          <section className="report-section">
            <h2 className="report-section-title">组合评估摘要</h2>
            <Paragraph style={{ fontSize: 15 }}>{comboReport.summary}</Paragraph>
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={comboReport.items}
              columns={[
                { title: '排名', dataIndex: 'rank', key: 'rank', width: 60 },
                { title: '商机名称', dataIndex: 'title', key: 'title' },
                { title: '国家', dataIndex: 'country', key: 'country', width: 80 },
                { title: '综合得分', dataIndex: 'compositeScore', key: 'compositeScore', width: 90, render: (s) => <Tag color="#B32620">{s}</Tag> },
                { title: '评级', dataIndex: 'rating', key: 'rating', width: 70 },
                { title: '市场', dataIndex: 'marketScore', key: 'marketScore', width: 60 },
                { title: '政策', dataIndex: 'policyScore', key: 'policyScore', width: 60 },
                { title: '信用', dataIndex: 'creditScore', key: 'creditScore', width: 60 },
                { title: '风险', dataIndex: 'riskLevel', key: 'riskLevel', width: 60 },
              ]}
            />
          </section>
        )}

        {isCombo && comboReport?.items?.map((item, index) => (
          <div key={item.id} className="report-combo-item">
            <section className="report-section">
              <h2 className="report-section-title">商机 {index + 1}：{item.title}</h2>
            </section>
            <SingleReportBody
              report={item}
              sections={sections}
              radarData={[
                { item: '市场需求潜力', type: '当前', score: item.marketScore },
                { item: '政策环境友好度', type: '当前', score: item.policyScore },
                { item: '交易信用安全度', type: '当前', score: item.creditScore },
              ]}
              barData={item.scoreBreakdown?.map((r) => ({ dimension: r.dimension.slice(0, 4), score: r.score })) || []}
              riskColumns={riskColumns}
            />
          </div>
        ))}

        {!isCombo && (
          <SingleReportBody report={report} sections={sections} radarData={radarData} barData={barData} riskColumns={riskColumns} />
        )}

        <section className="report-section report-appendix">
          <h2 className="report-section-title">附录</h2>
          <Paragraph><Text strong>数据来源：</Text>海关总署、国际商会贸易数据库、邓白氏信用报告、平台商机评估模型输出。</Paragraph>
          <Paragraph><Text strong>模型说明：</Text>{report.weightFormula}。阈值规则与排序结果来源于评估与排序模块。</Paragraph>
          <Paragraph><Text strong>使用说明：</Text>本报告可作为项目立项论证、市场拓展决策、客户洽谈及跨部门协同的统一事实底稿。</Paragraph>
          <Paragraph><Text strong>免责声明：</Text>基于平台模型与 Mock 数据生成，仅供内部研判参考，不构成投资建议或法律意见。</Paragraph>
        </section>
      </div>
    </div>
  )
}

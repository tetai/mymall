<template>
	<div class="app-container">
		<!--搜索栏 -->
		<el-form ref="fullPrivilegeActivityListQueryForm" :model="fullPrivilegeActivityListQuery" :inline="true">
			<el-form-item label="标题" prop="title">
				<el-input v-model="fullPrivilegeActivityListQuery.title" placeholder="请输入标题" clearable size="small" style="width: 240px" />
			</el-form-item>
			<el-form-item>
				<el-button type="primary" icon="el-icon-search" size="mini" @click="fullPrivilegeActivityListQueryFormSubmit">搜索</el-button>
				<el-button icon="el-icon-refresh" size="mini" @click="fullPrivilegeActivityListQueryFormReset">重置</el-button>
			</el-form-item>
		</el-form>

		<!-- 工具栏 -->
		<el-row :gutter="10" class="mb8">
			<el-col :span="1.5">
				<el-button v-permission="['promotion:coupon-template:create-card']" type="primary" icon="el-icon-plus" size="mini" @click="handleAddClick">新增</el-button>
			</el-col>
		</el-row>

		<!-- 满减送活动列表 -->
		<el-tabs v-model="activeName" style="margin-top:15px;" type="border-card" @tab-click="handleTabClick">
			<el-tab-pane v-for="item in tabMapOptions" :key="item.key" :label="item.label" :name="item.key">
				<keep-alive>
					<el-table v-loading="fullPrivilegeActivityListLoading" :data="fullPrivilegeActivityList" row-key="id">
						<el-table-column prop="title" label="活动名称" width="150" :show-overflow-tooltip="true" />
						<el-table-column prop="meetTypes" :formatter="formatMeetTypeTableColumn" label="类型" width="150" :show-overflow-tooltip="true" />
						<el-table-column :formatter="formatFullPrivilegeTextTableColumn" label="活动详情" width="200" :show-overflow-tooltip="true" />
						<el-table-column label="活动时间" align="center">
							<template slot-scope="scope">
								<span>
									{{ scope.row.startTime | parseTime('{y}-{m}-{d}') }}
									&nbsp;至&nbsp;
									{{ scope.row.endTime | parseTime('{y}-{m}-{d}') }}
								</span>
							</template>
						</el-table-column>
						<el-table-column label="创建时间" align="center">
							<template slot-scope="scope">
								<span>{{ scope.row.createTime | parseTime('{y}-{m}-{d}') }}</span>
							</template>
						</el-table-column>
						<el-table-column label="操作">
							<template slot-scope="scope">
								<el-button
										v-permission="['promotion:coupon-template:update-card']"
										type="text"
										size="mini"
										icon="el-icon-edit"
										@click="handleUpdateClick(scope.row)"
								>修改
								</el-button>
							</template>
						</el-table-column>
					</el-table>
				</keep-alive>
			</el-tab-pane>
		</el-tabs>


		<!-- 满减送活动列表的分页 -->
		<pagination
				v-show="fullPrivilegeActivityListTotal > 0"
				:total="fullPrivilegeActivityListTotal"
				:page.sync="fullPrivilegeActivityListQuery.pageNo"
				:limit.sync="fullPrivilegeActivityListQuery.pageSize"
				@pagination="getFullPrivilegeActivityList"
		/>

	</div>
</template>

<script>
import { pagePromotionActivity } from '@/api/promotion/promotionActivity'
import { getDataDicts, DATA_DICT_ENUM_VALE, getDataDictName } from '@/utils/dataDict'

import Pagination from '@/components/Pagination'

import { MeetTypeEnum, PreferentialTypeEnum, PromotionActivityTypeEnum, PromotionActivityStatusEnum } from '@/utils/constants'

export default {
	name: 'FullPrivilegeActivityList',
	components: { Pagination },
	data() {
		return {
		  // Tab 选项
      tabMapOptions: [
        { label: '所有活动', key: 'ALL' },
        { label: '未开始', key: 'WAIT' },
        { label: '进行中', key: 'RUN' },
        { label: '已结束', key: 'END' },
        { label: '已撤销', key: 'INVALID' }
      ],
      activeName: 'ALL',

			// 满减送活动列表
			fullPrivilegeActivityList: [],
			// 满减送活动总数
			fullPrivilegeActivityListTotal: 0,
			// 进度条
			fullPrivilegeActivityListLoading: true,
			// 查询条件
			fullPrivilegeActivityListQuery: {
				pageNo: 1,
				pageSize: 10,
				title: undefined,
				statuses: undefined,
				activityType: PromotionActivityTypeEnum.FULL_PRIVILEGE
			},

			// 枚举
      // MeetTypeEnum: MeetTypeEnum,

      // 数据字典
      // rangeTypeDataDicts: getDataDicts(DATA_DICT_ENUM_VALE.RANGE_TYPE),
		}
	},
	created() {
		this.getFullPrivilegeActivityList()
	},
	methods: {
	  // tab 选项点击
    handleTabClick() {
      // 设置查询 statuses 条件
			let statuses = []
			switch(this.activeName) {
				case "WAIT":
				  statuses.push(PromotionActivityStatusEnum.WAIT)
					break
				case "RUN":
          statuses.push(PromotionActivityStatusEnum.RUN)
          break
        case "END":
          statuses.push(PromotionActivityStatusEnum.END)
          break
        case "INVALID":
          statuses.push(PromotionActivityStatusEnum.INVALID)
          break
				default:
          statuses.push(PromotionActivityStatusEnum.WAIT, PromotionActivityStatusEnum.RUN,
            PromotionActivityStatusEnum.END, PromotionActivityStatusEnum.INVALID)
			}
			this.fullPrivilegeActivityListQuery.statuses = statuses.join(',')
      this.getFullPrivilegeActivityList()
		},
		// 加载满减送活动列表
		getFullPrivilegeActivityList() {
			this.fullPrivilegeActivityListLoading = true
			pagePromotionActivity(this.fullPrivilegeActivityListQuery).then(response => {
				// 取消加载中
				this.fullPrivilegeActivityListLoading = false
				// 设置数据
				this.fullPrivilegeActivityList = response.data.list
				this.fullPrivilegeActivityListTotal = response.data.total
			}).catch(() => {
				// 取消加载中
				this.fullPrivilegeActivityListLoading = false
			})
		},
    // 添加弹窗
    handleAddClick(row) {
      alert('正在开发中')
    },
		// 修改弹窗
		handleUpdateClick(row) {
      alert('正在开发中')
    },
		// 搜索表单提交
		fullPrivilegeActivityListQueryFormSubmit() {
			// 重置到第一页
			this.fullPrivilegeActivityListQuery.pageNo = 1
			// 加载满减送活动列表
			this.getFullPrivilegeActivityList()
		},
		// 搜索表单重置
		fullPrivilegeActivityListQueryFormReset() {
			// 重置表单
			this.resetForm('fullPrivilegeActivityListQueryForm')
			// 加载满减送活动列表
			this.getFullPrivilegeActivityList()
		},
		// 列表渲染（优惠内容）
    formatFullPrivilegeTextTableColumn(row) {
      let text = '';
      let fullPrivilege = row.fullPrivilege;
      for (let i in fullPrivilege.privileges) {
        let privilege = fullPrivilege.privileges[i];
        if (i > 0) {
          text += ';';
        }
        if (fullPrivilege.cycled) {
          text += '每';
        }
        if (privilege.meetType === MeetTypeEnum.PRICE) {
          text += '满 ' + privilege.meetValue / 100.0 + ' 元,';
        } else if (privilege.meetType === MeetTypeEnum.QUANTITY) {
          text += '满 ' + privilege.meetValue + ' 件,';
        }
        if (privilege.preferentialType === PreferentialTypeEnum.PRICE) {
          text += '减 ' + privilege.preferentialValue / 100.0 + ' 元';
        } else if (privilege.preferentialType === PreferentialTypeEnum.DISCOUNT) {
          text += '打 ' + privilege.preferentialValue / 10.0 + ' 折';
        }
      }
      return text;
		}
	}
}

</script>

<style scoped>

</style>

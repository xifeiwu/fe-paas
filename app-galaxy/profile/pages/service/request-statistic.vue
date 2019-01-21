<template>
  <div class="request-statistic">
    <svg class="pie" :viewBox="[0, 0, size, size]" :style="{width: `${size}px`, height: `${size}px`}">
      <template v-for="(item, index) in pathList">
        <g @mouseenter="onMouseEnter($event, item, index)"
           @mouseleave="onMouseLeave($event, item, index)"
           :class="{'is-active': activeIndex === index}"
        >
          <path :fill="colors[index]" :d="item"></path>
        </g>
      </template>
    </svg>
    <table-component
            :data="[
              { firstName: 'John', lastName: 'Lennon', instrument: 'Guitar', birthday: '04/10/1940', songs: 72 },
              { firstName: 'Paul', lastName: 'McCartney', instrument: 'Bass', birthday: '18/06/1942', songs: 70 },
              { firstName: 'George', lastName: 'Harrison', instrument: 'Guitar', birthday: '25/02/1943', songs: 22 },
              { firstName: 'Ringo', lastName: 'Starr', instrument: 'Drums', birthday: '07/07/1940', songs: 2 },
              { firstName: 'John', lastName: 'Lennon', instrument: 'Guitar', birthday: '04/10/1940', songs: 72 },
              { firstName: 'Paul', lastName: 'McCartney', instrument: 'Bass', birthday: '18/06/1942', songs: 70 },
              { firstName: 'George', lastName: 'Harrison', instrument: 'Guitar', birthday: '25/02/1943', songs: 22 },
              { firstName: 'Ringo', lastName: 'Starr', instrument: 'Drums', birthday: '07/07/1940', songs: 2 },
              ]"
            :showFilter="false"
            :activeIndex="activeIndex"
            @row-event="handleRowEvent"
    >
      <table-column show="firstName" label="First name">
        <template slot-scope="scope">
          <span :style="{
              display: 'inline-block',
              padding: ['4px', '4px'],
              backgroundColor: colors[scope.index],
              marginRight: '3px'
            }"></span><span>{{scope.firstName}}</span>
        </template>
      </table-column>
      <table-column show="lastName" label="Last name"></table-column>
      <table-column show="instrument" label="Instrument"></table-column>
      <table-column show="songs" label="Songs" data-type="numeric"></table-column>
      <table-column show="birthday" label="Birthday" data-type="date:DD/MM/YYYY"></table-column>
      <table-column :sortable="false" :filterable="false">
        <template slot-scope="artist">
          <a :href="'#' + artist.firstName.toLowerCase()">
            Edit
        </a>
        </template>
      </table-column>
    </table-component>
  </div>
</template>
<style lang="scss">
  .request-statistic {
    display: flex;
    .pie {
      g.is-active {
        /*box-shadow: 0 2px 2px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08);*/
        stroke: white;
        stroke-width: 3px;
      }
    }
    .table-component {
      tbody {
        tr {
          font-weight: normal;
          &.is-active {
            background-color: gray;
          }
        }
      }
    }
  }
</style>
<script>

  import { TableColumn, TableComponent } from '$components/custom/simple-table';
  export default {
    components: {
      TableColumn,
      TableComponent,
    },
    created() {

    },
    mounted() {
//      this.pieSections = this.getNodes();
    },
    data() {
      return {
        activeIndex: null,
        radius: 100,
        extral: 6,
//        size: 220, // radius * 2 + 10
        data: [113, 100, 50, 28, 27],
        colors: ['#468966', '#FFF0A5', '#FFB03B', '#B64926', '#8E2800',
          '#d87c7c','#919e8b', '#d7ab82',  '#6e7074','#61a0a8','#efa18d', '#787464', '#cc7e63', '#724e58', '#4b565b',
          '#dd6b66','#759aa0','#e69d87','#8dc1a9','#ea7e53','#eedd78','#73a373','#73b9bc',
          '#7289ab', '#91ca8c','#f49f42',
          '#C1232B','#27727B','#FCCE10','#E87C25','#B5C334', '#FE8463','#9BCA63','#FAD860',
          '#F3A43B','#60C0DD','#D7504B','#C6E579','#F4E001','#F0805A','#26C0C0','#2ec7c9'],
      }
    },
    computed: {
      size() {
        return this.radius * 2 + this.extral * 2;
      },
      angle() {
        var total = this.data.reduce((pre, current) => pre + current, 0);
        var result = [];
        this.data.forEach(it => {
//          result.push(Math.ceil(360 * it / total));
          result.push((360 * it / total));
        });
        return result;
      },
      pathList() {
        var startAngle = 0, endAngle = 0;
        var cx = this.radius + this.extral, cy = this.radius + this.extral;
        var results = this.angle.map((it, index) => {
          var radius = this.radius;
          if (this.activeIndex === index) {
            radius += this.extral;
          }
          startAngle = endAngle;
          endAngle = startAngle + it;
          let x1 = (cx + radius * Math.cos(Math.PI * startAngle / 180));
          let y1 = (cy + radius * Math.sin(Math.PI * startAngle / 180));

          let x2 = (cx + radius * Math.cos(Math.PI * endAngle / 180));
          let y2 = (cy + radius * Math.sin(Math.PI * endAngle / 180));

          var d = `M${cx},${cy}  L${x1},${y1} A${radius},${radius} 0 0,1 ${x2}, ${y2} z`;
          return d;
        });
        return results;

      }
    },
    methods: {
      onMouseEnter(evt, item, index) {
        console.log('mouse-enter');
        this.activeIndex = index;
        console.log(evt.target);
//        console.log(item, index);
      },
      onMouseLeave(evt, item, index) {
        console.log('mouse-leave');
        this.activeIndex = null;
      },
      handleRowEvent(action, $event, row, index) {
//        console.log(action, $event, row, index);
        switch (action) {
          case 'mouse-enter':
            this.activeIndex = index;
            break;
          case 'mouse-leave':
            this.activeIndex = null;
            break;
        }
      }
    }

  }
</script>

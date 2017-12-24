// <script>
export default {
    props: {
        'onClick': null,
        'isShow': 'show'
    },
 
    data() {
        return {
            test: 123,
            show: 'hello jsx'
        };
    },

    methods: {
        // onClick: function(){console.log('click here')},
        clickME: function(){console.log('click me')},
    },
 
    render() {
        return (
            <div class="test" on-click={ this.clickME }>
                { this.test }
                { this.show + '' }
            </div>
        );
    }
}
// </script>

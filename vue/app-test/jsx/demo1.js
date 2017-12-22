// <script>
export default {
    props: {
        'onClick': null,
        'isShow': null
    },
 
    data() {
        return {
            test: 123,
            clickME: 'click me'
        };
    },

    method: {
        onClick: function(){console.log('click here')},
        clickME: function(){console.log('click me')},
    },
 
    render() {
        return (
            <div class="test" onClick={ this.clickME }>
                { this.test }
                { this.isShow + '' }
            </div>
        );
    }
}
// </script>

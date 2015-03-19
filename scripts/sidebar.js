var SidebarContainer = React.createClass({
    render: function () {
        return <div createClass="sidebar-container"><h1>Hey!</h1></div>;
    }
});

//document.addEventListener("DOMContentLoaded", function () {
    React.render(<SidebarContainer />, document.getElementById('main'));
//});
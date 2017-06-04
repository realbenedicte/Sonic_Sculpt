/* Object: GButton
 * -----------------------
 * This is a button object. It represents a button the screen, and houses
 * some important info on that button. Specifically, it contains the HTML
 * id string for the button, the actual HTML element itself (button), the
 * function that is to be called when it is clicked, and a 1-or-0 value that
 * reflects if the button is currently "active" or not. 
 */

function GButton(html_id, click_func, is_active) {
	this.html_id = html_id;
	this.button = document.getElementById(html_id);
	this.click_func = click_func;
	this.is_active = is_active;
}
/* Object: GButton
 * -----------------------
 * This is a button object. It represents a button on the screen, and houses
 * some important info on that button. Specifically, it contains the HTML
 * id string for the button, the actual HTML element itself (button), the
 * function that is to be called when it is clicked, and a 1-or-0 value that
 * reflects if the button is currently "active" or not.
 *
 * NOTE: In it's current implementation, only the Record button is a 
 * GButton object. Soon, this will be changed so that the Record button
 * does not need to be a GButton, and the GButton will no longer be
 * used in the app.
 */

function GButton(html_id, click_func, is_active) {
	this.html_id = html_id;
	this.button = document.getElementById(html_id);
	this.click_func = click_func;
	this.is_active = is_active;
}
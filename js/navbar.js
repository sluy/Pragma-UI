/**
 * Pragma.Libs.Navbar
 * Plugin para la barra de navegación.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-navbar : define la barra de navegación
 * data-pragma-navbar-responsive-toggle="elemento"   : El control que posea este atributo, abrirá o cerrará el menú
 *																										 alternativo responsivo en caso de que el mismo esté habilitado.
 *																										 El control que posea este atributo SIEMPRE debe estar definido
 *																										 dentro de la barra de navegación; no puede ser llamado desde
 *																										 elementos externos via HTML.
 * data-pragma-navbar-options="[opciones]"     :   Opciones de configuración del menú desplegable via HTML.
 * #-----------------
 * Métodos:
 * #-----------------
 * Navbar.responsive_open()    : Abre el menú alternativo. Sólo será disponible si 'responsive' está habilitado,
																 el menú alternativo está activado y cerrado.
 * Navbar.responsive_close()   : Cierra el menú alternativo. Sólo será disponible si 'responsive' está habilitado,
																 el menú alternativo está activado y abierto.
 * Navbar.responsive_toggle()  : Abre o cierra el menú alternativo dependiendo del estado actual del mismo. Sólo será																					 disponible si 'responsive' y el menú alternativo está habilitado.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.navbar.before_init        : Lanzado al inicializar el plugin Navbar.
 * pragma.navbar.after_init         : Lanzado al terminar la configuración inicial del plugin Navbar.
 * pragma.navbar.responsive.opening : Evento lanzado inmediatamente después de llamarse el método [responsive_open()].
 * pragma.navbar.responsive.open    : Evento lanzado cuando terminó de ejecutarse el método[responsive_open()] y es 
																			visible para el usuario.
 * pragma.navbar.responsive.closing : Evento lanzado inmediatamente después de llamarse el método [responsive_close()].
 * pragma.navbar.responsive.closed  : Evento lanzado cuando terminó de ejecutarse el método[responsive_close()] y es 
																			invisible para el usuario.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/navbar.less
 * less/mixins/navbar.less
 */
$(function (Pragma, $, undefined)
{
	"use strict";
	Pragma.Libs.Navbar = function (element, options)
	{
		var self = this;
		self.options = options;
		self.$el = element;
		self.$spy = (self.$el.find(" > .row").length == 1) ? self.$el.find(" > .row") : self.$el;

		//Menú alternativo
		self.$responsive = $('<div class="responsive-nav"></div>').appendTo(self.$el);
		self.responsive = false; //Define si el menú alternativo está o no habilitado.
		self.non_responsive_width = 0; //Tamaño de los controles antes de habilitar el menú alternativo
		self.$el.trigger("pragma.navbar.before_init");
		/**
		* Método privado.
		* Oculta los controles de la barra de navegación y los cambia a un menú alternativo.
		*/
		function responsive()
		{
			if (!self.responsive)
			{
				var width = 5;


				self.$spy.find(" > *:not(.responsive-nav)").each(function ()
				{
					width += $(this).outerWidth(true);
				});
				if (width >= self.$spy.width())
				{
					if (self.$spy != self.$el)
					{
						self.$spy.appendTo(self.$responsive);
					} else
					{
						self.$el.find(" > *:not(.responsive-nav):not(.brand):not(.responsive-control)").each(function ()
						{
							$(this).appendTo(self.$responsive);
						});
					}

					self.responsive_close();
					self.responsive = true;
					self.non_responsive_width = width;
					show_responsive_buttons();
					self.$el.trigger("pragma.navbar.responsive");
				}
			}
		}
		/**
		* Método privado.
		* Muestra los controles de la barra de navegación en su posición original.
		*/
		function remove_responsive()
		{
			if (self.responsive && self.non_responsive_width < self.$el.width())
			{
				self.$responsive.find(" > *").each(function ()
				{
					$(this).insertBefore(self.$responsive);
				});
				self.responsive_close();
				self.non_responsive_width = 0;
				self.responsive = false;
				hide_responsive_buttons();
				self.$el.trigger("pragma.navbar.unresponsive");
			}
		}
		/**
		* Método privado.
		* En caso que los controles dentro de la barra de navegación tengan mayor ancho que la barra
		* en si misma, moverá los mismos a un menú alternativo.
		* Si los controles han sido movidos al menú alternativo y el ancho de la barra de navegación
		* es mayor al de los controles previamente movidos, devolverá los mismos a su posición inicial.
		*/
		function toggle_responsive()
		{
			if (!self.responsive)
			{
				var width = 0;

				self.$el.find(" > *:not(.responsive-nav)").each(function ()
				{
					width += $(this).outerWidth(true);
				});
				if (width >= self.$el.width())
				{
					responsive();
				}
			} else
			{
				remove_responsive();
				var width = 0;

				self.$el.find(" > *:not(.responsive-nav)").each(function ()
				{
					width += $(this).outerWidth(true);
				});
				if (width >= self.$el.width())
				{
					responsive();
				}
			}
		}
		/**
		* Método privado.
		* Muestra los botones para controlar el menú alternativo.
		*/
		function show_responsive_buttons()
		{
			self.$el.find("[data-navbar-responsive-toggle]").each(function ()
			{
				$(this).removeClass("hide");
			});
		}
		/**
		* Método privado.
		* Oculta los botones para controlar el menú alternativo.
		*/
		function hide_responsive_buttons()
		{
			self.$el.find("[data-navbar-responsive-toggle]").each(function ()
			{
				$(this).addClass("hide");
			});
		}
		/**
		* Abre el menú alternativo.
		* Sólo lo abrirá si el menú está activo y cerrado.
		* Puede llamarse directamente con $("#menu").pragma("navbar","collapse_open")
		*/
		self.responsive_open = function ()
		{
			if (self.responsive && !self.$responsive.hasClass("open"))
			{
				//Evento inmediato al comenzar a abrir
				self.$el.trigger("pragma.navbar.responsive.opening");

				//Agrega la clase "active" a todos los botones para el control del menú alternativo
				self.$el.find("[data-navbar-responsive-toggle]").each(function ()
				{
					$(this).addClass("active");
				});

				self.$responsive.stop(true).slideToggle(
					Pragma.Utils.get_instance_option(self, "fx_speed", "open", "responsive"),
					Pragma.Utils.get_instance_option(self, "fx_easing", "open", "responsive"),
					function ()
					{
						self.$responsive.addClass("open");
						//Evento al terminar de abrir y ser visible por completo para el usuario
						self.$el.trigger("pragma.navbar.responsive.opening");
					}
				);
			}
		}
		/**
		* Cierra el menú alternativo.
		* Sólo lo cerrará si el menú está activo y abierto.
		* Puede llamarse directamente con $("#menu").pragma("navbar","collapse_close")
		*/
		self.responsive_close = function ()
		{
			if (self.responsive && self.$responsive.hasClass("open"))
			{
				//Evento inmediato al comenzar a cerrar
				self.$el.trigger("pragma.navbar.responsive.closing");
				self.$el.find("[data-navbar-responsive-toggle]").each(function ()
				{
					$(this).removeClass("active");
				});
				self.$responsive.stop(true).slideToggle(
					Pragma.Utils.get_instance_option(self, "fx_speed", "close", "responsive"),
					Pragma.Utils.get_instance_option(self, "fx_easing", "close", "responsive"),
					function ()
					{
						self.$responsive.removeClass("open");
						//Evento al terminar de cerrar y ser invisible por completo para el usuario
						self.$el.trigger("pragma.navbar.responsive.closed");
					}
				);
			}
		}
		/**
		* Alterna el estado del menú colapsado entre abierto(open) y cerrado(close) dependiendo del 
		* estado actual.
		*/
		self.responsive_toggle = function ()
		{
			if (self.responsive)
			{
				if (!self.$responsive.hasClass("open"))
				{
					self.responsive_open();
				} else
				{
					self.responsive_close();
				}
			}
		}

		/**
		* Añade los eventos de los botones para mostrar/ocultar el menú alternativo.
		*/
		function configure_responsive_buttons()
		{
			/*Añadimos la clase "collapse_control" para que no sea ocultado al mostrar el menú alternativo*/
			self.$el.find("[data-navbar-responsive-toggle]").each(function ()
			{
				$(this).addClass("responsive-control");
			})
			/*Añadimos los eventos*/
			/**Toggle**/
			self.$el.on("click.pragma.navbar.responsive.toggle", '[data-navbar-responsive-toggle]', function (e)
			{
				e.preventDefault();
				e.stopPropagation();
				self.$el.pragma("navbar", "responsive_toggle");
			});
		}
		/**
		* Añade el botón para abrir/cerrar el menú alternativo.
		*/
		function add_responsive_button()
		{
			var button = $('<a href="#" data-navbar-responsive-toggle>' + self.options.responsive_button_text + '</a>');
			var control = $('<section class="responsive-control"></section>');
			button.appendTo(control);

			button.addClass("button " + self.options.responsive_button_size);
			if (self.options.responsive_button_position == "left")
			{
				control.prependTo(self.$el);
			} else
			{
				control.addClass("right").insertBefore(self.$responsive);
			}
			if (self.options.responsive_button_style != "auto")
			{
				button.addClass(self.options.responsive_button_style);
			} else
			{
				var styles = ["inverse", "primary", "secondary", "success", "tip", "warning", "danger"];
				for (var i = 0; i < styles.length; i++)
				{
					if (self.$el.hasClass(styles[i]))
					{
						button.addClass(styles[i]);
					}
				}
			}
		}
		/**Acciones al iniciar el script**/
		if (self.options.responsive && self.options.responsive_button)
		{
			add_responsive_button();
		}
		configure_responsive_buttons() //Configuramos los botones de control para el menú alternativo.
		hide_responsive_buttons(); //Escondemos los botones para el control de menú alternativo.


		toggle_responsive(); //Cambiamos al menú alternativo de ser necesario.
		/**Eventos al redimensionar la ventana del navegador**/
		$(window).resize(function (e)
		{
			toggle_responsive(); //Cambiamos al menú alternativo de ser necesario.
		});
		/**Eventos al hacer click fuera del menú alternativo**/

		/*Bug por el momento, cancela los dropdowns internos
		$("html").click(function (e)
		{
		//Por defecto lo cierra
		self.responsive_close();
		});
		self.$el.click(function (e)
		{
		//Si se hizo click en el mismo menú, prevenimos lo cierre
		e.stopPropagation();
		});*/
		self.$el.trigger("pragma.navbar.after_init");
	}

  //Versión del plugin
  Pragma.Libs.Navbar.Ver = "1.0.0";
	/**Opciones del plugin 'navbar'**/
	Pragma.Libs.Navbar.Defaults = {
		responsive: true, //Determina si el menú alternativo estará habilitado.
		responsive_fx: true, //Determina si el menú alternativo tendrá el efecto 'deslizado' o no.
		responsive_fx_speed: 400, //Velocidad de la animación. Sólo será usado si collapse_fx_{accion}_speed está en 0.
		responsive_fx_easing: false, //Efecto easing de la animación.Sólo será usado si collapse_fx_{accion}_speed está en false.
		responsive_open_fx_speed: "inherit", //Velocidad de la animación al abrir el menú alternativo.
		responsive_close_fx_speed: "inherit", //Velocidad de la animación al cerrar el menú alternativo.
		responsive_open_fx_easing: "inherit", //Efecto easing de la animación al abrir el menú alternativo.
		responsive_close_fx_easing: "inherit", //Efecto easing de la animación al cerrar el menú alternativo.
		responsive_button: true, //Define si agregará automáticamente el botón para desplegar/ocultar el menú alternativo.
		responsive_button_text: 'Menú', //Texto del botón para desplegar/ocultar el menú alternativo.
		responsive_button_style: "auto", //Estilo del botón para desplegar/ocultar el menú alternativo.
		responsive_button_size: "sm", //Tamaño del botón para desplegar/ocultar el menú alternativo.
		responsive_button_position: "right" //Posición del botón para desplegar/ocultar el menú alternativo.
	}
	/**
	* Inicializamos el plugin para las barras de navegación existentes
	* al cargar el script.
	*/
	$(function ()
	{
		$("[data-pragma-navbar]").each(function (e)
		{
			$(this).pragma("navbar");
		});
	});
} (window.Pragma = window.Pragma || {}, jQuery));
